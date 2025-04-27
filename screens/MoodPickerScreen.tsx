import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  Animated,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { theme } from '../utils/theme';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner-native';
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');

// 20 mood emojis + labels
const MOOD_LIST = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😕', label: 'Worried' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😫', label: 'Stressed' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '🥺', label: 'Lonely' },
  { emoji: '🙏', label: 'Grateful' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '😔', label: 'Disappointed' },
  { emoji: '🤯', label: 'Overwhelmed' },
  { emoji: '😟', label: 'Anxious' },
  { emoji: '🤗', label: 'Hopeful' },
  { emoji: '🧘', label: 'Relaxed' },
  { emoji: '🤒', label: 'Sick' },
  { emoji: '😳', label: 'Embarrassed' },
  { emoji: '🥳', label: 'Celebrating' },
];



// Define symptoms mapping before use
const MOOD_SYMPTOMS: Record<string, string[]> = {
  Happy: ['Fatigue', 'Headache', 'Tension', 'Low Energy', 'Poor Sleep'],
  Calm: ['Relaxed', 'Peaceful', 'Centered', 'Mindful', 'Balanced'],
  Neutral: ['Fine', 'Content', 'Steady', 'Even', 'Regular'],
  Worried: ['Anxious', 'Overthinking', 'Tense', 'Restless', 'Uncertain'],
  Sad: ['Low Energy', 'Withdrawn', 'Heavy', 'Tired', 'Down'],
  Excited: ['Restless', 'Energetic', 'Buzzing', 'Unable to Sleep', 'Hyper'],
  Stressed: ['Tight Shoulders', 'Headache', 'Clenched Jaw', 'Irritable', 'Racing Thoughts'],
  Tired: ['Yawning', 'Heavy Eyelids', 'Lagging', 'Low Motivation', 'Slow'],
  Angry: ['Clenched Fists', 'Raised Voice', 'Irritable', 'Hot Face', 'Tense'],
  Lonely: ['Withdrawn', 'Sadness', 'Yearning', 'Isolated', 'Empty'],
  Grateful: ['Warmth', 'Connected', 'Joyful', 'Content', 'Uplifted'],
  Loved: ['Affection', 'Connected', 'Warm', 'Safe', 'Cherished'],
  Disappointed: ['Downcast', 'Frustrated', 'Let Down', 'Sighing', 'Uninspired'],
  Overwhelmed: ['Scattered', 'Anxious', 'Heavy Chest', 'Racing Mind', 'Frozen'],
  Anxious: ['Sweaty Palms', 'Racing Heart', 'Worry', 'Trembling', 'Restless'],
  Hopeful: ['Lightness', 'Positive', 'Anticipation', 'Inspired', 'Motivated'],
  Relaxed: ['Calm', 'Loose', 'Leisurely', 'At Ease', 'Unburdened'],
  Sick: ['Weakness', 'Headache', 'Chills', 'Fatigue', 'Aches'],
  Embarrassed: ['Blushing', 'Avoiding Eye Contact', 'Flustered', 'Self-Conscious', 'Awkward'],
  Celebrating: ['Joyous', 'Energetic', 'Elated', 'Cheery', 'Party Mood'],
};





// Base moods with styling
const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#4ade80', symptoms: MOOD_SYMPTOMS.Happy },
  { emoji: '😌', label: 'Calm', color: '#60a5fa', symptoms: MOOD_SYMPTOMS.Calm },
  { emoji: '😐', label: 'Neutral', color: '#94a3b8', symptoms: MOOD_SYMPTOMS.Neutral },
  { emoji: '😕', label: 'Worried', color: '#fbbf24', symptoms: MOOD_SYMPTOMS.Worried },
  { emoji: '😢', label: 'Sad', color: '#fb7185', symptoms: MOOD_SYMPTOMS.Sad }
];

// Daily quotes based on moods
const MOOD_QUOTES = {
  Happy: [
    '"Happiness is not something ready made. It comes from your own actions." - Dalai Lama',
    '"The most wasted of all days is one without laughter." - E.E. Cummings',
  ],
  Calm: [
    '"Peace comes from within. Do not seek it without." - Buddha',
    '"Calm mind brings inner strength and self-confidence." - Dalai Lama',
  ],
  Neutral: [
    '"Life is a balance of holding on and letting go." - Rumi',
    '"In the middle of every difficulty lies opportunity." - Albert Einstein',
  ],
  Worried: [
    '"Worry does not empty tomorrow of its sorrow, it empties today of its strength." - Corrie Ten Boom',
    '"This too shall pass." - Persian Proverb',
  ],
  Sad: [
    '"Even the darkest night will end and the sun will rise." - Victor Hugo',
    '"The pain you feel today is the strength you feel tomorrow." - Unknown',
  ],
};

export default function MoodPickerScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [quote, setQuote] = useState('');// Mood + Symptom suggestions
const MOOD_SUGGESTIONS = {
  Happy: {
    Grateful: "Write down three things you're grateful for today.",
    Energetic: "Channel your energy into something you love today!",
    Connected: "Reach out and share your happiness with someone."
  },
  Calm: {
    Relaxed: "Savor the moment with a few deep breaths.",
    Peaceful: "Write down what made you feel peaceful today.",
    Sleepy: "Take a mindful break to recharge."
  },
  Neutral: {
    Bored: "Start a small creative project that excites you!",
    Meh: "Maybe a short gratitude list will uplift your mood.",
    Unfocused: "Pause for a mindful breathing reset."
  },
  Worried: {
    Anxiety: "Try a 2-minute calming breathing exercise.",
    Overthinking: "Journaling might help unload your racing thoughts.",
    Fatigue: "Pause for a short mindful break to recharge."
  },
  Sad: {
    Lonely: "Write about a connection you miss or appreciate.",
    "Low Energy": "Take a walk and notice small moments around you.",
    Tearful: "Let your emotions flow freely by journaling them."
  }
};

const WELLNESS_QUOTES = [
  "Your mind will answer most questions if you learn to relax and wait for the answer. — William S. Burroughs",
  "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
  "Self-care is not a luxury. It is a necessity. — Audre Lorde",
  "You can't stop the waves, but you can learn to surf. — Jon Kabat-Zinn",
  "Be gentle with yourself. You're doing the best you can. — Unknown"
];  const [suggestion, setSuggestion] = useState('');
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Update suggestion and quote when mood changes
  useEffect(() => {
    if (selectedMood) {
      // Get random quote for selected mood
      const moodQuotes = MOOD_QUOTES[selectedMood.label];
      const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
      setQuote(randomQuote);

      // Generate suggestion based on mood
      generateSuggestion();
    }
  }, [selectedMood]);

  const generateSuggestion = async () => {
    if (!selectedMood) return;

    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate a short, empathetic suggestion for someone feeling ${selectedMood.label.toLowerCase()}. Keep it under 50 words and make it actionable.`
          }]
        })
      });

      const { completion } = await response.json();
      setSuggestion(completion);
      setReflection(completion); // Prefill reflection with suggestion
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setSuggestion('Take a moment to breathe and reflect on your feelings.');
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood first');
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase.from('mood_logs').insert({
        user_id: user.data.user?.id,
        mood: selectedMood.emoji,
        mood_label: selectedMood.label,
        intensity,
        symptoms: selectedSymptoms,
        reflection_text: reflection,
        suggestion_text: suggestion,
        quote_text: quote,
      });

      if (error) throw error;

      toast.success('Mood logged successfully!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood entry');
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width * 0.25,
      index * width * 0.25,
      (index + 1) * width * 0.25,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 1.2, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.moodItem,
          { transform: [{ scale }] }
        ]}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={[
          styles.moodLabel,
          selectedMood?.label === item.label && { color: item.color }
        ]}>
          {item.label}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="How are you feeling?"
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content}>      {/* Mood Picker */}      <View style={styles.pickerContainer}>
        {/* left/right fade cues */}
        <View style={styles.fadeLeft} pointerEvents="none" />
        <View style={styles.fadeRight} pointerEvents="none" />          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.pickerList}
          >
          {MOOD_LIST.map((mood) => {
            const isSelected = selectedMood?.label === mood.label;
            return (
              <Pressable
                key={mood.label}
                onPress={() => setSelectedMood(mood)}
                style={[
                  styles.pickerItem,
                  isSelected && styles.pickerItemSelected,
                ]}
              >
                <Text style={[styles.pickerEmoji, isSelected && styles.pickerEmojiSelected]}>
                  {mood.emoji}
                </Text>
                <Text style={[styles.pickerLabel, isSelected && styles.pickerLabelSelected]}>
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

        {selectedMood && (
          <View style={styles.details}>
            {/* Intensity Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>
                Intensity: <Text style={styles.intensityValue}>{intensity}</Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={intensity}
                onValueChange={setIntensity}
                minimumTrackTintColor={selectedMood.color}
                thumbTintColor={selectedMood.color}
              />
            </View>

            {/* Symptoms */}
            <View style={styles.symptomsContainer}>
              <Text style={styles.label}>Symptoms</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.symptomsScroll}
              >              {(MOOD_SYMPTOMS[selectedMood.label] ?? []).map((symptom) => (
                  <Pressable
                    key={symptom}
                    style={[
                      styles.symptomChip,
                      selectedSymptoms.includes(symptom) && {
                        backgroundColor: selectedMood.color,
                      },
                    ]}
                    onPress={() => {
                      setSelectedSymptoms((prev) =>
                        prev.includes(symptom)
                          ? prev.filter((s) => s !== symptom)
                          : [...prev, symptom]
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.symptomText,
                        selectedSymptoms.includes(symptom) && styles.selectedSymptomText,
                      ]}
                    >
                      {symptom}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Suggestion & Reflection */}
            <View style={styles.reflectionContainer}>
              <Text style={styles.label}>Reflection</Text>
              <TextInput
                style={styles.reflectionInput}
                multiline
                value={reflection}
                onChangeText={setReflection}
                placeholder="How are you feeling? What's on your mind?"
                textAlignVertical="top"
              />
              
              {quote && (
                <Text style={styles.quote}>{quote}</Text>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.actions}>
              <Pressable
                style={styles.actionButton}
                onPress={() => navigation.navigate('Journal', { reflection })}
              >
                <MaterialIcons name="edit" size={24} color={selectedMood.color} />
                <Text style={styles.actionText}>Journal</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => navigation.navigate('AIChat', { mood: selectedMood.label })}
              >
                <MaterialIcons name="psychology" size={24} color={selectedMood.color} />
                <Text style={styles.actionText}>AI Coach</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => navigation.navigate('MindfulBreathing')}
              >
                <MaterialIcons name="spa" size={24} color={selectedMood.color} />
                <Text style={styles.actionText}>Breathe</Text>
              </Pressable>
            </View>

            {/* Save Button */}
            <Pressable
              style={[styles.saveButton, { backgroundColor: selectedMood.color }]}
              onPress={saveMoodEntry}
            >
              <Text style={styles.saveButtonText}>Save Mood Entry</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  moodCarousel: {
    height: 120,
    marginVertical: 20,
  },
  moodList: {
    paddingHorizontal: width * 0.375,
  },
  moodItem: {
    width: width * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  details: {
    padding: 20,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  intensityValue: {
    color: theme.colors.text.secondary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  symptomsContainer: {
    marginBottom: 24,
  },
  symptomsScroll: {
    flexGrow: 0,
  },
  symptomChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  symptomText: {
    color: theme.colors.text.primary,
    fontSize: 14,
  },
  selectedSymptomText: {
    color: '#fff',
  },
  reflectionContainer: {
    marginBottom: 24,
  },
  reflectionInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    ...theme.colors.card.shadow,
  },
  quote: {
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    ...theme.colors.card.shadow,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },  // --- Mood Picker styles ---
  pickerContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  pickerList: {
    paddingHorizontal: 16,
  },
  pickerItem: {
    width: 64,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pickerItemSelected: {
    transform: [{ scale: 1.2 }],
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },  pickerEmoji: {
    fontSize: 40,
    color: '#333',
  },
  pickerEmojiSelected: {
    color: theme.colors.primary,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },  pickerLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'rgba(248,249,252,0.8)',
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'rgba(248,249,252,0.8)',
  },
});