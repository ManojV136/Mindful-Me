import AsyncStorage from '@react-native-async-storage/async-storage';

interface MoodEntry {
  timestamp: number;
  mood: string;
  value: number;
}

interface MeditationSession {
  timestamp: number;
  duration: number;
  type: string;
}

interface JournalMetrics {
  timestamp: number;
  wordCount: number;
  category: string[];
}

interface TherapySession {
  id: string;
  therapist: string;
  date: string;
  time: string;
  type: 'Video Call' | 'Audio Call' | 'Chat';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

interface HealthMetrics {
  timestamp: number;
  heartRate: number;
  steps: number;
}

export const saveMoodEntry = async (mood: string) => {
  try {
    const moodValues = {
      'Very Happy': 5,
      'Happy': 4,
      'Neutral': 3,
      'Sad': 2,
      'Very Sad': 1
    };

    const entry: MoodEntry = {
      timestamp: Date.now(),
      mood,
      value: moodValues[mood] || 3
    };

    const existing = await AsyncStorage.getItem('moodEntries');
    const entries = existing ? [...JSON.parse(existing), entry] : [entry];
    await AsyncStorage.setItem('moodEntries', JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving mood:', error);
  }
};

export const saveMeditationSession = async (duration: number, type: string) => {
  try {
    const session: MeditationSession = {
      timestamp: Date.now(),
      duration,
      type
    };

    const existing = await AsyncStorage.getItem('meditationSessions');
    const sessions = existing ? [...JSON.parse(existing), session] : [session];
    await AsyncStorage.setItem('meditationSessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving meditation:', error);
  }
};

export const saveJournalEntry = async (entry: any) => {
  try {
    // Save the journal entry
    const existing = await AsyncStorage.getItem('journalEntries');
    const entries = existing ? JSON.parse(existing) : [];
    const updatedEntries = [entry, ...entries].sort((a, b) => b.timestamp - a.timestamp);
    await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

    // Save metrics for dashboard tracking
    const metrics = {
      timestamp: entry.timestamp,
      wordCount: entry.content.split(/\s+/).length,
      categories: entry.categories || [],
      mood: entry.mood,
      title: entry.title
    };

    const existingMetrics = await AsyncStorage.getItem('journalMetrics');
    const allMetrics = existingMetrics ? JSON.parse(existingMetrics) : [];
    allMetrics.unshift(metrics);
    await AsyncStorage.setItem('journalMetrics', JSON.stringify(allMetrics));
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

export const saveJournalMetrics = async (wordCount: number, categories: string[]) => {
  try {
    const metrics: JournalMetrics = {
      timestamp: Date.now(),
      wordCount,
      category: categories
    };

    const existing = await AsyncStorage.getItem('journalMetrics');
    const allMetrics = existing ? [...JSON.parse(existing), metrics] : [metrics];
    await AsyncStorage.setItem('journalMetrics', JSON.stringify(allMetrics));
  } catch (error) {
    console.error('Error saving journal metrics:', error);
  }
};

export const saveHealthMetrics = async (heartRate: number, steps: number) => {
  try {
    const metrics: HealthMetrics = {
      timestamp: Date.now(),
      heartRate,
      steps
    };

    const existing = await AsyncStorage.getItem('healthMetrics');
    const allMetrics = existing ? [...JSON.parse(existing), metrics] : [metrics];
    await AsyncStorage.setItem('healthMetrics', JSON.stringify(allMetrics));
  } catch (error) {
    console.error('Error saving health metrics:', error);
  }
};

export const saveTherapySession = async (session: TherapySession) => {
  try {
    const existing = await AsyncStorage.getItem('therapySessions');
    const sessions = existing ? JSON.parse(existing) : [];
    const updatedSessions = [session, ...sessions].sort((a, b) => 
      new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
    );
    await AsyncStorage.setItem('therapySessions', JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving therapy session:', error);
    throw error;
  }
};

export const getTherapySessions = async () => {
  try {
    const sessions = await AsyncStorage.getItem('therapySessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting therapy sessions:', error);
    return [];
  }
};

export const updateSessionStatus = async (sessionId: string, status: TherapySession['status']) => {
  try {
    const sessions = await getTherapySessions();
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, status } : session
    );
    await AsyncStorage.setItem('therapySessions', JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

  // General screen / action tracker
export const trackEvent = async (screen: string, action: string = 'view') => {
  try {
    const timestamp = Date.now();
    const existing = await AsyncStorage.getItem('analyticsEvents');
    const events = existing ? JSON.parse(existing) : [];
    events.push({ screen, action, timestamp });
    await AsyncStorage.setItem('analyticsEvents', JSON.stringify(events));
  } catch (e) {
    console.error('Error tracking event:', e);
  }
};

// Add initial test data if none exists
const initializeTestData = async () => {
  const today = new Date();
  
  // Test meditation sessions for the past 30 days
  const testMeditations = [
    { timestamp: today.getTime(), duration: 1028, type: 'Mindful Breathing' },
    { timestamp: today.getTime() - (1 * 24 * 60 * 60 * 1000), duration: 876, type: 'Body Scan' },
    { timestamp: today.getTime() - (2 * 24 * 60 * 60 * 1000), duration: 1028, type: 'Mindful Breathing' },
    { timestamp: today.getTime() - (3 * 24 * 60 * 60 * 1000), duration: 876, type: 'Body Scan' },
    { timestamp: today.getTime() - (5 * 24 * 60 * 60 * 1000), duration: 1028, type: 'Mindful Breathing' },
    { timestamp: today.getTime() - (7 * 24 * 60 * 60 * 1000), duration: 876, type: 'Body Scan' },
    { timestamp: today.getTime() - (10 * 24 * 60 * 60 * 1000), duration: 1028, type: 'Mindful Breathing' },
    { timestamp: today.getTime() - (14 * 24 * 60 * 60 * 1000), duration: 876, type: 'Body Scan' },
    { timestamp: today.getTime() - (21 * 24 * 60 * 60 * 1000), duration: 1028, type: 'Mindful Breathing' },
    { timestamp: today.getTime() - (28 * 24 * 60 * 60 * 1000), duration: 876, type: 'Body Scan' },
  ];

  // Test mood entries for the past 30 days
  const testMoods = [
    { timestamp: today.getTime(), mood: 'Happy', value: 4 },
    { timestamp: today.getTime() - (1 * 24 * 60 * 60 * 1000), mood: 'Very Happy', value: 5 },
    { timestamp: today.getTime() - (2 * 24 * 60 * 60 * 1000), mood: 'Neutral', value: 3 },
    { timestamp: today.getTime() - (3 * 24 * 60 * 60 * 1000), mood: 'Happy', value: 4 },
    { timestamp: today.getTime() - (4 * 24 * 60 * 60 * 1000), mood: 'Very Happy', value: 5 },
    { timestamp: today.getTime() - (5 * 24 * 60 * 60 * 1000), mood: 'Happy', value: 4 },
    { timestamp: today.getTime() - (6 * 24 * 60 * 60 * 1000), mood: 'Neutral', value: 3 },
    { timestamp: today.getTime() - (7 * 24 * 60 * 60 * 1000), mood: 'Sad', value: 2 },
    { timestamp: today.getTime() - (8 * 24 * 60 * 60 * 1000), mood: 'Happy', value: 4 },
    { timestamp: today.getTime() - (9 * 24 * 60 * 60 * 1000), mood: 'Very Happy', value: 5 },
    { timestamp: today.getTime() - (14 * 24 * 60 * 60 * 1000), mood: 'Happy', value: 4 },
    { timestamp: today.getTime() - (21 * 24 * 60 * 60 * 1000), mood: 'Neutral', value: 3 },
    { timestamp: today.getTime() - (28 * 24 * 60 * 60 * 1000), mood: 'Happy', value: 4 },
  ];

  // Test journal entries for the week
  const testJournals = [
    {
      id: '1',
      title: 'Finding Joy in Small Things',
      content: 'Today was a beautiful day. The sun was shining and I took a moment to appreciate the simple pleasures in life.',
      date: today.toLocaleDateString(),
      time: '10:30',
      timestamp: today.getTime(),
      mood: { emoji: '😊', label: 'Happy' },
      categories: ['Gratitude', 'Reflection']
    },
    {
      id: '2',
      title: 'Overcoming Challenges',
      content: 'Had a difficult situation at work but managed to handle it well. Proud of how I maintained my composure.',
      date: new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
      time: '15:45',
      timestamp: today.getTime() - (2 * 24 * 60 * 60 * 1000),
      mood: { emoji: '😌', label: 'Calm' },
      categories: ['Challenges', 'Achievement']
    }
  ];  // Test therapy sessions - mix of past and upcoming
  const testTherapySessions = [
    // Upcoming sessions
    {
      id: '1',
      therapist: 'Dr. Sarah Johnson',
      date: new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: '10:00 AM',
      type: 'Video Call',
      status: 'upcoming',
      notes: 'Follow-up on meditation progress'
    },
    {
      id: '2',
      therapist: 'Dr. Michael Chen',
      date: new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: '2:00 PM',
      type: 'Video Call',
      status: 'upcoming',
      notes: 'Monthly check-in'
    },
    // Past sessions
    {
      id: '3',
      therapist: 'Dr. Sarah Johnson',
      date: new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: '11:00 AM',
      type: 'Video Call',
      status: 'completed',
      notes: 'Discussed stress management techniques'
    },
    {
      id: '4',
      therapist: 'Dr. Michael Chen',
      date: new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: '3:00 PM',
      type: 'Audio Call',
      status: 'completed',
      notes: 'Worked on anxiety coping strategies'
    },
    {
      id: '5',
      therapist: 'Dr. Sarah Johnson',
      date: new Date(today.getTime() - (21 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: '10:00 AM',
      type: 'Video Call',
      status: 'completed',
      notes: 'Initial session - set treatment goals'
    }
  ];

  // Initialize data if not exists
  const initializeIfEmpty = async (key, data) => {
    const existing = await AsyncStorage.getItem(key);
    if (!existing) {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    }
  };

  await Promise.all([
    initializeIfEmpty('meditationSessions', testMeditations),
    initializeIfEmpty('moodEntries', testMoods),
    initializeIfEmpty('journalEntries', testJournals),
    initializeIfEmpty('therapySessions', testTherapySessions)
  ]);
};

export const getDashboardData = async () => {
  try {
    // Initialize test data
    await initializeTestData();

    const [moodEntries, meditationSessions, journalMetrics, healthMetrics, analyticsEvents] = await Promise.all([
      AsyncStorage.getItem('moodEntries'),
      AsyncStorage.getItem('meditationSessions'),
      AsyncStorage.getItem('journalMetrics'),
      AsyncStorage.getItem('healthMetrics'),
      AsyncStorage.getItem('analyticsEvents')
    ]);

    // Filter data to only include last 7 days
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const filterRecentData = (data) => {
      return data ? JSON.parse(data).filter(item => item.timestamp > oneWeekAgo) : [];
    };

    const moods = filterRecentData(moodEntries);
    const meditations = filterRecentData(meditationSessions);
    const journals = filterRecentData(journalMetrics);
    const health = filterRecentData(healthMetrics);
    const analytics = filterRecentData(analyticsEvents);

    // Calculate streaks
    const calculateStreak = (data, type) => {
      if (!data.length) return 0;
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const hasEntry = data.some(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate.toDateString() === date.toDateString();
        });
        
        if (hasEntry) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    };

    return {
      moods,
      meditations,
      journals,
      health,
      analytics,
      stats: {
        moodStreak: calculateStreak(moods, 'mood'),
        meditationStreak: calculateStreak(meditations, 'meditation'),
        journalStreak: calculateStreak(journals, 'journal'),
        totalSessions: meditations.length,
        totalJournals: journals.length,
        averageMood: moods.reduce((acc, curr) => acc + curr.value, 0) / (moods.length || 1),
        totalSteps: health.reduce((acc, curr) => acc + curr.steps, 0),
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      moods: [],
      meditations: [],
      journals: [],
      health: [],
      analytics: [],
      stats: {
        moodStreak: 0,
        meditationStreak: 0,
        journalStreak: 0,
        totalSessions: 0,
        totalJournals: 0,
        averageMood: 0,
        totalSteps: 0,
      }
    };
  }
};