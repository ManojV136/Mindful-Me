import React, { useState, useEffect } from 'react';
import { trackEvent, saveJournalEntry } from '../utils/dashboardStorage';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Modal } from 'react-native';
import { theme } from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import * as Speech from 'expo-speech';
import JournalEntryList from '../components/JournalEntryList';

const MOODS = [
  { emoji: '😄', label: 'Very Happy' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😞', label: 'Sad' },
  { emoji: '😢', label: 'Very Sad' },
];

const CATEGORIES = [
  'Gratitude',
  'Reflection',
  'Dreams',
  'Daily Recap',
  'Goals',
  'Emotions',
  'Challenges',
  'Achievements',
];

export default function JournalScreen({ navigation }) {
  useEffect(() => { trackEvent('JournalScreen'); }, []);  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Mood-based title suggestionsexport default function JournalScreen({ navigation }) {
  useEffect(() => { trackEvent('JournalScreen'); }, []);
  const getMoodBasedTitle = (mood) => {
    if (!mood) return '';
    
    const suggestions = {
      'Very Happy': [
        'Celebrating Today\'s Joy ✨',
        'Capturing Happy Moments 🌟',
        'A Day Full of Smiles 😊',
        'Grateful and Glowing ⭐',
      ],
      'Happy': [
        'Simple Pleasures Today 🌸',
        'Finding Joy in Little Things 🌿',
        'Moments of Contentment ☺️',
        'Today\'s Happy Notes 📝',
      ],
      'Neutral': [
        'Today\'s Reflections 💭',
        'Processing My Thoughts 🤔',
        'Mindful Moments 🍃',
        'Taking Stock Today 📋',
      ],
      'Sad': [
        'Finding My Way Through 🌧️',
        'Honest Feelings Today 💙',
        'Self-Care Journey 🫂',
        'Growing Through Emotions 🌱',
      ],
      'Very Sad': [
        'Dear Diary... 📔',
        'Processing Heavy Feelings 💜',
        'One Day at a Time 🌅',
        'Finding Light in Darkness ⭐',
      ],
    };
    
    const moodSuggestions = suggestions[mood.label];
    return moodSuggestions ? moodSuggestions[Math.floor(Math.random() * moodSuggestions.length)] : '';
  };

  const getCategoryPrompt = (category) => {
    const prompts = {
      'Gratitude': [
        `List 3 things you're grateful for today and why...`,
        `What unexpected blessing did you encounter today?`,
        `Who made a positive impact on your day?`,
        `What simple pleasure brought you joy today?`,
      ],
      'Reflection': [
        `What moment today made you pause and think?`,
        `How did today differ from your expectations?`,
        `What did you learn about yourself today?`,
        `What would you do differently if you could repeat today?`,
      ],
      'Dreams': [
        `What's one step you took today toward your dreams?`,
        `Visualize where you want to be in one year...`,
        `What's holding you back from your dreams?`,
        `Describe your perfect day in detail...`,
      ],
      'Daily Recap': [
        'What was the highlight of your day?',
        'What challenged you today and how did you respond?',
        'Rate your day from 1-10 and explain why...',
        'What made today unique?',
      ],
      'Goals': [
        `What progress did you make on your goals today?`,
        `What small win did you celebrate today?`,
        `What obstacle is standing in your way?`,
        `What's your next milestone and how will you reach it?`,
      ],
      'Emotions': [
        `Describe your emotions today using colors...`,
        `What triggered your strongest emotion today?`,
        `How did your feelings influence your actions?`,
        `What helped you manage your emotions today?`,
      ],
      'Challenges': [
        `What challenge are you facing and how can you overcome it?`,
        `What resources do you need to face this challenge?`,
        `What lesson can you find in this difficult situation?`,
        `How have you grown from past challenges?`,
      ],
      'Achievements': [
        'What made you proud today?',
        'What small victory deserves celebration?',
        'How did you push outside your comfort zone?',
        'What skill did you improve today?',
      ],
    };
    
    const categoryPrompts = prompts[category];
    return categoryPrompts ? categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)] : '';
  };
  const [isRecording, setIsRecording] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [isPrivacyLocked, setIsPrivacyLocked] = useState(false);  const [entries, setEntries] = useState([]);

  // Load entries on mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const savedEntries = await AsyncStorage.getItem('journalEntries');
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };
    loadEntries();
  }, []);

  // Save entries whenever they change
  useEffect(() => {
    const saveEntries = async () => {
      try {
        await AsyncStorage.setItem('journalEntries', JSON.stringify(entries));
      } catch (error) {
        console.error('Error saving entries:', error);
      }
    };
    if (entries.length > 0) {
      saveEntries();
    }
  }, [entries]);  const [editingEntry, setEditingEntry] = useState(null);  const [titleError, setTitleError] = useState('');

  const handleSave = async () => {
    // Reset error state
    setTitleError('');

    // Validate title
    if (!title.trim()) {
      setTitleError('Please enter a title for your journal entry');
      return;
    }

    // Validate entry
    if (!entry.trim()) {
      toast.error('Please write something in your journal entry');
      return;
    }

    const now = new Date();
    
    try {
      const journalEntry = {
        id: editingEntry ? editingEntry.id : Date.now().toString(),
        title: title.trim(),
        content: entry.trim(),
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        timestamp: now.getTime(),
        mood: selectedMood,
        categories: selectedCategories,
      };

      // Save to AsyncStorage
      const existingEntriesStr = await AsyncStorage.getItem('journalEntries');
      let existingEntries = existingEntriesStr ? JSON.parse(existingEntriesStr) : [];

      if (editingEntry) {
        // Update existing entry
        existingEntries = existingEntries.map(e => 
          e.id === editingEntry.id ? journalEntry : e
        );
        toast.success('Journal entry updated');
      } else {
        // Add new entry
        existingEntries = [journalEntry, ...existingEntries];
        toast.success('Journal entry saved');
      }    // Save and track the journal entry
    await saveJournalEntry(journalEntry);
    await trackEvent('JournalScreen', editingEntry ? 'updateEntry' : 'saveEntry');
    
    // Update local state and AsyncStorage
    await AsyncStorage.setItem('journalEntries', JSON.stringify(existingEntries));
    setEntries(existingEntries);
      
      // Reset form
      setTitle('');
      setEntry('');
      setSelectedMood(null);
      setSelectedCategories([]);
      setIsWriting(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error('Failed to save journal entry');
    }
  };  const handleEntryPress = (entry) => {
    setTitle(entry.title);
    setEntry(entry.content);
    setEditingEntry(entry);
    setIsWriting(true);
  };

  const handleNewEntry = () => {
    setTitle('');
    setEntry('');
    setEditingEntry(null);
    setIsWriting(true);
  };

  if (!isWriting) {
    return (      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable 
              style={styles.backButton} 
              onPress={() => navigation.navigate('Home')}
            >              <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
            </Pressable>
            <Text style={styles.title}>Journal Entries</Text>
          </View>
          <Text style={styles.subtitle}>Record and review your thoughts</Text>
        </View>        <Pressable 
          style={styles.newEntryButton} 
          onPress={handleNewEntry}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.newEntryButtonText}>New Entry</Text>
        </Pressable>        <JournalEntryList entries={entries} onPressEntry={handleEntryPress} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable 
              style={styles.backButton} 
              onPress={() => setIsWriting(false)}
            >              <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
            </Pressable>            <Text style={styles.title}>{editingEntry ? 'Edit Entry' : 'New Entry'}</Text>
          </View>          <Text style={styles.subtitle}>
            {editingEntry 
              ? 'Update your thoughts and feelings'
              : 'Write down your thoughts and feelings'
            }
          </Text>
        </View>

        <View style={styles.card}>          <View style={styles.titleContainer}>
            <TextInput
              style={[
                styles.titleInput,
                titleError ? styles.titleInputError : null
              ]}
              placeholder={selectedMood ? getMoodBasedTitle(selectedMood) : "Entry Title"}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError('');
              }}
              placeholderTextColor="#94a3b8"
            />
            {titleError ? (
              <Text style={styles.errorText}>{titleError}</Text>
            ) : selectedMood ? (
              <Text style={styles.titleSuggestion}>
                Suggested title based on your mood
              </Text>
            ) : null}
          </View>          <View style={styles.moodSelector}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOODS.map((mood) => (
                <Pressable
                  key={mood.label}
                  style={[
                    styles.moodButton,
                    selectedMood?.label === mood.label && styles.selectedMoodButton
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryTag,
                    selectedCategories.includes(category) && styles.selectedCategoryTag
                  ]}
                  onPress={() => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(selectedCategories.filter(c => c !== category));
                    } else {
                      setSelectedCategories([...selectedCategories, category]);
                    }
                  }}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategories.includes(category) && styles.selectedCategoryText
                  ]}>{category}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput              style={styles.entryInput}
              placeholder={selectedCategories.length > 0 
                ? getCategoryPrompt(selectedCategories[selectedCategories.length - 1])
                : "Write your thoughts here..."}
              value={entry}
              onChangeText={setEntry}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
            />          <View style={styles.inputActions}>

              <Pressable
                style={styles.actionButton}
                onPress={async () => {
                  try {
                    const response = await fetch('https://api.a0.dev/ai/llm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        messages: [
                          {
                            role: 'system',
                            content: 'You are an empathetic journaling assistant. Provide brief, insightful reflections and gentle questions based on the journal entry. Keep responses under 100 words.',
                          },
                          {
                            role: 'user',
                            content: entry,
                          },
                        ],
                      }),
                    });
                    const data = await response.json();
                    setAiInsight(data.completion);
                    setShowAIInsights(true);
                  } catch (error) {
                    toast.error('Could not generate AI insights');
                  }
                }}
              >                <MaterialIcons name="psychology" size={24} color={theme.colors.primary} />
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => setIsPrivacyLocked(!isPrivacyLocked)}
              >
                <MaterialIcons              name={isPrivacyLocked ? "lock" : "lock-open"}
              size={24}
              color={theme.colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>            <MaterialIcons name={editingEntry ? "update" : "save"} size={24} color="#fff" />
            <Text style={styles.saveButtonText}>{editingEntry ? 'Update Entry' : 'Save Entry'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16,
  },
  titleSuggestion: {
    fontSize: 12,    color: theme.colors.primary,
    marginTop: 4,
    marginLeft: 12,
  },
  moodSelector: {
    marginBottom: 16,
  },
  moodButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedMoodButton: {
    backgroundColor: '#f1f5f9',
    borderColor: '#6366f1',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  categoriesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  selectedCategoryTag: {    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    color: '#64748b',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  textInputContainer: {
    flex: 1,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  newEntryButton: {
    margin: 20,    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  newEntryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },  titleInput: {
    fontSize: 18,
    color: '#1e293b',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  titleInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 12,
  },
  entryInput: {
    fontSize: 16,
    color: '#334155',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    height: 200,
    marginBottom: 16,
  },
  saveButton: {    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});