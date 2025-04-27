import React, { useEffect } from 'react';
import { trackEvent } from '../utils/dashboardStorage';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import WellnessCoach from '../components/WellnessCoach';

export default function AIChatScreen({ navigation }) {
  useEffect(() => { trackEvent('AIChatScreen'); }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialIcons name="arrow-back" size={24} color="#6366f1" />
          </Pressable>
          <Text style={styles.title}>AI Wellness Coach</Text>
        </View>
      </View>      <WellnessCoach />
      { /* track user->AI messages */ }
      { /* inside WellnessCoach handleSend you'll call trackEvent('AIChatScreen','userMessage') etc */ }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});