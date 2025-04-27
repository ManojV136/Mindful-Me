import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TalkingAvatar from '../components/TalkingAvatar';

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('Ram');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('userName');
      if (stored) setUserName(stored);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>          <View style={styles.headerTop}>
            <Text style={styles.greeting}>Hi Ram!</Text>
            <Pressable onPress={() => navigation.navigate('Profile')}>
              <MaterialIcons name="person" size={28} color={theme.colors.primary} />
            </Pressable>
          </View>
          <View style={styles.avatarContainer}>
            <TalkingAvatar userName={userName} />
          </View>
        </View>

        <Pressable
          style={styles.moodButton}
          onPress={() => navigation.navigate('MoodPicker')}
        >
          <Text style={styles.moodButtonText}>😊  Log My Mood</Text>
        </Pressable>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Sessions')}>
              <MaterialIcons name="calendar-today" size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Sessions</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Meditation')}>
              <MaterialIcons name="self-improvement" size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Meditation</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Dashboard')}>
              <MaterialIcons name="analytics" size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Analytics</Text>
            </Pressable>
          </View>
        </View>

        {/* DAILY JOURNAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Journal</Text>
          <Text style={styles.sectionSubtitle}>Record your thoughts and feelings</Text>
          <Pressable
            style={styles.fullWidthBtn}
            onPress={() => navigation.navigate('Journal')}
          >
            <Text style={styles.fullWidthBtnText}>Write Today's Entry</Text>
          </Pressable>
        </View>

        {/* AI WELLNESS COACH */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Wellness Coach</Text>
          <Text style={styles.sectionSubtitle}>Get supportive guidance 24/7</Text>
          <Pressable
            style={styles.fullWidthBtn}
            onPress={() => navigation.navigate('AIChat')}
          >
            <Text style={styles.fullWidthBtnText}>Talk to AI Coach</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  content: { 
    padding: theme.spacing.md 
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subGreeting: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },  moodButton: {
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    marginVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  moodButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },  actionText: {
    marginTop: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  avatarContainer: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  fullWidthBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  fullWidthBtnText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});