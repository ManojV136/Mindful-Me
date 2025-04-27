import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface Mood {
  emoji: string;
  label: string;
  color: string;
}

interface Suggestion {
  type: 'journal' | 'ai' | 'session';
  text: string;
}

interface MoodMessage {
  message: string;
  suggestions: Suggestion[];
}

interface MoodPickerProps {
  selectedMood: Mood | null;
  onSelectMood: (mood: Mood & {
    intensity: number;
    symptoms: string[];
    suggestion?: Suggestion;
  }) => void;
}

const moods: Mood[] = [
  { emoji: '😊', label: 'Happy', color: '#4ade80' },
  { emoji: '😌', label: 'Calm', color: '#60a5fa' },
  { emoji: '😐', label: 'Neutral', color: '#94a3b8' },
  { emoji: '😕', label: 'Worried', color: '#fbbf24' },
  { emoji: '😢', label: 'Sad', color: '#fb7185' },
];

const moodMessages: Record<string, MoodMessage> = {
  Happy: {
    message: `That's wonderful! Keep spreading that positive energy!`,
    suggestions: [
      { type: 'journal', text: `Write about your happiness` },
      { type: 'ai', text: `Share joy with AI coach` },
    ],
  },
  Calm: {
    message: `Peaceful vibes—take a moment to breathe.`,
    suggestions: [
      { type: 'journal', text: `Journal your tranquility` },
      { type: 'ai', text: `Get mindfulness tips` },
    ],
  },
  Neutral: {
    message: `Balanced day—reflect on what stands out.`,
    suggestions: [
      { type: 'journal', text: `Reflect neutrally` },
      { type: 'ai', text: `Chat for inspiration` },
    ],
  },
  Worried: {
    message: `Take deep breaths—you're not alone.`,
    suggestions: [
      { type: 'journal', text: `Write your concerns` },
      { type: 'session', text: `Book a session` },
    ],
  },
  Sad: {
    message: `It's okay to feel down. This shall pass.`,
    suggestions: [
      { type: 'journal', text: `Express feelings in journal` },
      { type: 'ai', text: `Talk to AI coach` },
      { type: 'session', text: `Schedule therapy session` },
    ],
  },
};

const symptomOptions = ['Fatigue', 'Headache', 'Tension'];

export default function MoodPicker({
  selectedMood,
  onSelectMood,
  onAnalyzeFace,
}: MoodPickerProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const [intensity, setIntensity] = useState(5);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {    Animated.timing(fade, {
      toValue: selectedMood ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedMood]);

  const toggleSymptom = (sym: string) => {
    setSymptoms((s) =>
      s.includes(sym) ? s.filter((x) => x !== sym) : [...s, sym]
    );
  };

  const handleSuggestion = (sug: Suggestion) => {
    if (!selectedMood) return;
    onSelectMood({
      ...selectedMood,
      intensity,
      symptoms,
      suggestion: sug,
    });
  };

  return (
    <View style={styles.wrap}>      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moods}
      >
        {moods.map((m) => (
          <Pressable
            key={m.label}
            style={[
              styles.moodBtn,
              selectedMood?.label === m.label && styles.moodSelected,
              { borderColor: m.color },
            ]}
            onPress={() => onSelectMood({ ...m, intensity, symptoms })}
          >
            <Text style={styles.emoji}>{m.emoji}</Text>
            <Text style={styles.label}>{m.label}</Text>
          </Pressable>
        ))}        {/* removed face analysis button */}
      </ScrollView>

      {selectedMood && (
        <Animated.View style={[styles.detail, { opacity: fade }]}>
          <Text style={styles.section}>Intensity: {intensity}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={intensity}
            minimumTrackTintColor={selectedMood.color}
            onValueChange={setIntensity}
          />

          <Pressable
            style={styles.toggleSymptoms}
            onPress={() => setShowSymptoms((v) => !v)}
          >
            <Text style={styles.section}>
              {showSymptoms ? 'Hide' : 'Add'} Symptoms
            </Text>
            <MaterialIcons
              name={showSymptoms ? 'expand-less' : 'expand-more'}
              size={20}
              color="#64748b"
            />
          </Pressable>          {showSymptoms &&
            (symptomOptions ?? []).map((sym) => (
              <Pressable
                key={sym}
                style={[
                  styles.symptomBtn,
                  symptoms.includes(sym) && styles.symptomActive,
                ]}
                onPress={() => toggleSymptom(sym)}
              >
                <Text
                  style={[
                    styles.symptomText,
                    symptoms.includes(sym) && { color: '#fff' },
                  ]}
                >
                  {sym}
                </Text>
              </Pressable>
            ))}

          <Text style={[styles.section, { marginTop: 16 }]}>
            Suggestions
          </Text>          {(moodMessages[selectedMood?.label ?? '']?.suggestions ?? []).map((sug, i) => (
            <Pressable
              key={i}
              style={styles.sugBtn}
              onPress={() => handleSuggestion(sug)}
            >
              <MaterialIcons
                name={
                  sug.type === 'journal'
                    ? 'edit'
                    : sug.type === 'ai'
                    ? 'psychology'
                    : 'calendar-today'
                }
                size={20}
                color={selectedMood.color}
              />
              <Text style={styles.sugText}>{sug.text}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16 },  moods: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  moodBtn: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  moodSelected: {
    transform: [{ scale: 1.1 }],
    backgroundColor: '#f0f9ff',
  },
  emoji: { fontSize: 24 },
  label: { fontSize: 12, color: '#64748b', marginTop: 4 },
  faceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
  },
  faceText: { marginLeft: 4, color: '#4f46e5' },
  detail: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    ...StyleSheet.absoluteFillObject,
  },
  section: { fontSize: 14, fontWeight: '600', color: '#334155' },
  toggleSymptoms: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  symptomBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginTop: 8,
  },
  symptomActive: { backgroundColor: '#6366f1' },
  symptomText: { color: '#334155' },
  sugBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginTop: 8,
  },
  sugText: { marginLeft: 8, color: '#1e293b', flex: 1 },
});