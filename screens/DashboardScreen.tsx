import React, { useState, useEffect } from 'react';
import { getHealthSamples, watchSteps } from '../utils/healthService';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { getDashboardData, saveHealthMetrics, trackEvent } from '../utils/dashboardStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { theme } from '../utils/theme';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [dashboardData, setDashboardData] = useState({
    moods: [],
    meditations: [],
    journals: []
  });  const [stepCount, setStepCount] = useState(0);  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      const data = await getDashboardData();
      if (!isMounted) return;
      setDashboardData(data);
      // initialize today’s steps from stored healthMetrics
      const todayKey = new Date().toISOString().split('T')[0];
      const todaySteps = (data.health || [])
        .filter(h => new Date(h.timestamp).toISOString().split('T')[0] === todayKey)
        .reduce((sum, h) => sum + h.steps, 0);
      setStepCount(todaySteps);
    };

    // Initial load & periodic refresh
    loadDashboardData();
    const refreshInterval = setInterval(loadDashboardData, 300000);

    // Async init for native health + live subscription
    let unsubscribe: () => void = () => {};
    const initHealth = async () => {
      const samples = await getHealthSamples();
      if (!isMounted) return;
      setDashboardData(d => ({ ...d, health: samples }));
      const todayKey = new Date().toISOString().split('T')[0];
      const todaySteps = samples
        .filter(h => new Date(h.timestamp).toISOString().split('T')[0] === todayKey)
        .reduce((sum, h) => sum + h.steps, 0);
      setStepCount(todaySteps);

      unsubscribe = watchSteps(steps => {
        if (isMounted) {
          setStepCount(steps);
          saveHealthMetrics(0, steps);
          trackEvent('Dashboard', 'updateSteps');
        }
      });
    };

    initHealth();

    // Track views
    trackEvent('Dashboard', 'view');
    trackEvent('Dashboard', 'viewHealthMetrics');

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []);  // Build actual mood trends from last 7 days of entries
  const moodData = React.useMemo(() => {
    // Initialize day keys
    const today = new Date();
    const dayKeys: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dayKeys.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    // Sum values per weekday
    const sums: number[] = Array(7).fill(0);
    const counts: number[] = Array(7).fill(0);
    dashboardData.moods?.forEach(({ timestamp, value }: any) => {
      const date = new Date(timestamp);
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      const idx = dayKeys.indexOf(label);
      if (idx >= 0) {
        sums[idx] += value;
        counts[idx] += 1;
      }
    });
    // Average mood per day
    const data = sums.map((sum, i) => counts[i] ? sum / counts[i] : 0);
    return {
      labels: dayKeys,
      datasets: [{
        data,
        color: () => theme.colors.primary,
        strokeWidth: 2,
      }],
    };
  }, [dashboardData.moods]);

  const journalStats = {
    totalEntries: 15,
    weeklyEntries: 5,
    streak: 7,
    commonThemes: ['Gratitude', 'Work', 'Family', 'Health'],
    lastEntry: '2 hours ago',
    wordCount: 2345
  };

  const mindfulMinutes = {
    total: 45,
    breakdown: [
      { name: 'Meditation', minutes: 20, color: '#F1C40F' },
      { name: 'Breathing', minutes: 15, color: '#2ECC71' },
      { name: 'Reflection', minutes: 10, color: '#E74C3C' },
    ]
  };

  const aiInteractions = {
    totalSessions: 12,
    weeklyCheckIns: 3,
    topTopics: ['Anxiety Relief', 'Sleep', 'Stress Management'],
    lastSession: '1 hour ago'
  };  const [goals, setGoals] = useState([
    { name: 'Journal Entry', completed: false },
    { name: 'Mood Check-in', completed: false },
    { name: 'Meditation', completed: false },
  ]);  useEffect(() => {
    if (dashboardData) {
      const today = new Date().toISOString().split('T')[0];
      const didJournal = dashboardData.journals.some(j => {
        const entryDate = new Date(j.timestamp).toISOString().split('T')[0];
        return entryDate === today;
      });
      const didMood = dashboardData.moods.some(m => {
        const date = new Date(m.timestamp).toISOString().split('T')[0];
        return date === today;
      });
      const didMeditate = dashboardData.meditations.some(s => {
        const date = new Date(s.timestamp).toISOString().split('T')[0];
        return date === today;
      });
      setGoals([
        { name: 'Journal Entry', completed: didJournal },
        { name: 'Mood Check-in', completed: didMood },
        { name: 'Meditation', completed: didMeditate },
      ]);
    }
  }, [dashboardData]);

  const dailyPrompt = {
    question: "What's one thing you're grateful for today?",
    category: 'Gratitude'
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeSelector}>
      {['week', 'month', 'year'].map((timeframe) => (
        <Pressable
          key={timeframe}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe && styles.selectedTimeframe
          ]}
          onPress={() => setSelectedTimeframe(timeframe)}
        >
          <Text style={[
            styles.timeframeText,
            selectedTimeframe === timeframe && styles.selectedTimeframeText
          ]}>
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderMoodTrends = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Mood Trends</Text>
        {renderTimeframeSelector()}
      </View>
      <LineChart
        data={moodData}
        width={screenWidth - 48}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(124, 157, 150, ${opacity})`,
          labelColor: () => theme.colors.text.secondary,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
      <Text style={styles.insight}>
        You felt calm most often this week. Stress levels peaked on Wednesday.
      </Text>
    </View>
  );

  const renderJournalingActivity = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Journaling Activity</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{journalStats.weeklyEntries}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{journalStats.totalEntries}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.streakBadge}>
            <MaterialIcons name="local-fire-department" size={24} color="#f59e0b" />
            <Text style={styles.streakText}>{journalStats.streak}</Text>
          </View>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>
      
      <View style={styles.themesContainer}>
        <Text style={styles.subTitle}>Common Themes</Text>
        <View style={styles.themesList}>
          {journalStats.commonThemes.map((theme, index) => (
            <View key={index} style={styles.themeTag}>
              <Text style={styles.themeText}>{theme}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMindfulMinutes = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mindful Minutes</Text>
      <PieChart
        data={mindfulMinutes.breakdown.map(item => ({
          name: item.name,
          population: item.minutes,
          color: item.color,
          legendFontColor: theme.colors.text.secondary,
          legendFontSize: 12,
        }))}
        width={screenWidth - 48}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        center={[screenWidth / 4, 0]}
      />
      <Text style={styles.insight}>
        {`Total: ${mindfulMinutes.total} mindful minutes this week`}
      </Text>
    </View>
  );

  const renderAICoachInteractions = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>AI Coach Interactions</Text>
      <View style={styles.aiStats}>
        <View style={styles.statRow}>
          <MaterialIcons name="psychology" size={24} color={theme.colors.primary} />
          <Text style={styles.aiStatText}>
            {`${aiInteractions.weeklyCheckIns} check-ins this week`}
          </Text>
        </View>
        <View style={styles.topicsList}>
          <Text style={styles.subTitle}>Most Discussed Topics</Text>
          {aiInteractions.topTopics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <MaterialIcons name="chat" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );  const renderHealthMetrics = () => {
    const { health = [], stats = {} } = dashboardData;
    // Today’s steps from live pedometer, and compute heart rates
    const dailySteps = stepCount;
    const stepGoal = 10000;
    const heartRates = health.map(h => h.heartRate);
    const currentHeartRate = heartRates.length ? heartRates[heartRates.length - 1] : 0;
    const avgHeartRate = heartRates.length 
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) 
      : 0;    // Build a 7-day steps array (Day1 = six days ago ... Today)
    const today = new Date();
    const dailyStepsMap: Record<string, number> = {};
    health.forEach(h => {
      const dateKey = new Date(h.timestamp).toISOString().split('T')[0];
      dailyStepsMap[dateKey] = (dailyStepsMap[dateKey] || 0) + h.steps;
    });
    const weeklySteps: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      weeklySteps.push(dailyStepsMap[key] ?? 0);
    }    // Removed per-render analytics hook here – moved up into main useEffect

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Tracking</Text>

        <View style={styles.healthMetricsContainer}>
          <View style={styles.healthMetric}>
            <MaterialIcons name="favorite" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.healthMetricValue}>
                {currentHeartRate} BPM
              </Text>
              <Text style={styles.healthMetricLabel}>Current HR</Text>
            </View>
          </View>
          <View style={styles.healthMetric}>
            <MaterialIcons name="directions-walk" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.healthMetricValue}>
                {dailySteps}
              </Text>
              <Text style={styles.healthMetricLabel}>Steps Today</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Daily Step Goal</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(dailySteps / stepGoal) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((dailySteps / stepGoal) * 100)}% of daily goal
          </Text>
        </View>

        <LineChart
          data={{
            labels: ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Today'],
            datasets: [
              {
                data: weeklySteps,
                color: () => theme.colors.primary,
                strokeWidth: 2
              }
            ]
          }}
          width={screenWidth - 48}
          height={180}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(124, 157, 150, ${opacity})`,
            labelColor: () => theme.colors.text.secondary,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.colors.primary
            }
          }}
          bezier
          style={styles.chart}
        />
        <Text style={styles.chartLabel}>Steps This Week</Text>
      </View>
    );
  };  const renderGoalsAndStreaks = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Daily Goals</Text>
      {goals.map((goal, index) => (
        <View key={index} style={styles.goalItem}>
          <View style={styles.goalInfo}>
            <MaterialIcons
              name={goal.completed ? "check-circle" : "radio-button-unchecked"}
              size={24}
              color={goal.completed ? theme.colors.primary : theme.colors.text.secondary}
            />
            <Text style={styles.goalText}>{goal.name}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDailyPrompt = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Daily Reflection</Text>
      <View style={styles.promptContainer}>
        <Text style={styles.promptText}>{dailyPrompt.question}</Text>
        <View style={styles.promptCategory}>
          <MaterialIcons name="category" size={16} color={theme.colors.primary} />
          <Text style={styles.categoryText}>{dailyPrompt.category}</Text>
        </View>
        <Pressable 
          style={styles.respondButton}
          onPress={() => navigation.navigate('Journal')}
        >
          <Text style={styles.respondButtonText}>Respond Now</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={styles.title}>Wellness Dashboard</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderDailyPrompt()}
        {renderMoodTrends()}
        {renderJournalingActivity()}
        {renderMindfulMinutes()}
        {renderAICoachInteractions()}        {renderHealthMetrics()}
        {renderGoalsAndStreaks()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.colors.card.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.full,
    padding: 4,
  },
  timeframeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  selectedTimeframe: {
    backgroundColor: theme.colors.surface,
    ...theme.colors.card.shadow,
  },
  timeframeText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  selectedTimeframeText: {
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  insight: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  streakText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  themesContainer: {
    marginTop: theme.spacing.md,
  },
  subTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  themesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  themeTag: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  themeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
  },
  aiStats: {
    gap: theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  aiStatText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
  },
  topicsList: {
    gap: theme.spacing.sm,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  topicText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  goalText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  promptContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  promptText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  promptCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
  },
  respondButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  respondButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',  },
  healthMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.lg,
  },
  healthMetric: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  healthMetricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  healthMetricLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  chartLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});