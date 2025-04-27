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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { toast } from 'sonner-native';
import { supabase } from '../utils/supabase';
import Slider from '@react-native-community/slider';
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');

const EMOJIS = [
  { emoji: '😊', label: 'Happy', sound: 'birds' },
  { emoji: '🤩', label: 'Excited', sound: 'upbeat' },
  { emoji: '😌', label: 'Calm', sound: 'ocean' },
  { emoji: '🙂', label: 'Content', sound: 'breeze' },
  { emoji: '😐', label: 'Neutral', sound: 'chime' },
  { emoji: '😴', label: 'Tired', sound: 'soft' },
  { emoji: '😕', label: 'Worried', sound: 'breath' },
  { emoji: '😫', label: 'Stressed', sound: 'rain' },
  { emoji: '😢', label: 'Sad', sound: 'rain' },
  { emoji: '😠', label: 'Angry', sound: 'storm' },
  { emoji: '😰', label: 'Anxious', sound: 'breath' },
  { emoji: '🥺', label: 'Lonely', sound: 'soft' },
  { emoji: '🙏', label: 'Grateful', sound: 'birds' },
  { emoji: '🤞', label: 'Hopeful', sound: 'breeze' },
];

const SYMPTOMS = ['Fatigue', 'Headache', 'Tension', 'Low Energy', 'Poor Sleep'];

export default function MoodPickerScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [muted, setMuted] = useState(false);
  const evolutionAnim = useRef(new Animated.Value(0)).current;
  const whisperAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (selectedMood && !muted) playSound();
    Animated.sequence([
      Animated.timing(evolutionAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
      Animated.timing(whisperAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    if (selectedMood) fetchAI();
    return () => soundRef.current?.unloadAsync();
  }, [selectedMood, muted]);

  const playSound = async () => {
    try {
      await soundRef.current?.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/chime.mp3'),
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch {}
  };

  const fetchAI = async () => {
    setAiSuggestion('Loading...');
    try {
      const res = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Supportive action for feeling ${selectedMood.label}.`
          }],
        }),
      });
      const { completion } = await res.json();
      setAiSuggestion(completion);
    } catch {
      setAiSuggestion('Unable to load suggestion.');
    }
  };

  const saveEntry = async () => {
    if (!selectedMood) return toast.error('Select a mood first');
    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from('mood_logs')
        .insert({
          user_id: user.data.user?.id,
          mood: selectedMood.label,
          intensity,
          symptoms,
          reflection_text: reflection,
          ai_suggestion: aiSuggestion,
        });
      if (error) throw error;
      toast.success('Mood logged!');
      navigation.navigate('Home');
    } catch (e:any) {
      toast.error(e.message || 'Save failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="How are you feeling today?"
        onBack={() => navigation.navigate('Home')}
        RightComponent={
          <Pressable onPress={() => setMuted(v => !v)}>
            <MaterialIcons
              name={muted ? 'volume-off' : 'volume-up'}
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
        }
      />
      <View style={styles.carousel}>
        <FlatList
          ref={flatListRef}
          data={EMOJIS}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.25}
          decelerationRate="fast"
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (width * 0.25));
            setSelectedMood(EMOJIS[idx]);
          }}
          contentContainerStyle={{ paddingHorizontal: width * 0.375 }}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.item,
                selectedMood?.label === item.label && styles.selected,
              ]}
              onPress={() => setSelectedMood(item)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </Pressable>
          )}
        />
      </View>
      {selectedMood && (
        <ScrollView style={styles.form}>
          <Animated.Text style={[styles.evo, { opacity: evolutionAnim }]}>
            {`${selectedMood.emoji} → 😌 → 😊`}
          </Animated.Text>
          <Animated.Text
            style={{
              opacity: whisperAnim,
              transform: [
                {
                  translateY: whisperAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [5, 0],
                  }),
                },
              ],
            }}
          >
            I’m here for you. Let’s take one step at a time.
          </Animated.Text>

          <Text style={styles.label}>Intensity: {intensity}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={intensity}
            onValueChange={setIntensity}
            minimumTrackTintColor={theme.colors.primary}
          />

          <Text style={styles.label}>Symptoms</Text>
          <View style={styles.symptoms}>
            {SYMPTOMS.map(s => (
              <Pressable
                key={s}
                style={[
                  styles.sym,
                  symptoms.includes(s) && styles.symActive,
                ]}
                onPress={() =>
                  setSymptoms(prev =>
                    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                  )
                }
              >
                <Text
                  style={[
                    styles.symText,
                    symptoms.includes(s) && { color: '#fff' },
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Reflection</Text>
          <TextInput
            style={styles.input}
            placeholder={`Today feels ${selectedMood.label.toLowerCase()}, and I...`}
            value={reflection}
            onChangeText={setReflection}
            multiline
          />

          <Text style={styles.label}>Suggestion</Text>
          <Text style={styles.suggestion}>{aiSuggestion}</Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.btn}
              onPress={() =>
                navigation.navigate('Journal', { prompt: aiSuggestion })
              }
            >
              <Text>Journal</Text>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={() => navigation.navigate('AIChat')}
            >
              <Text>Chat AI</Text>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={() => navigation.navigate('MindfulBreathing')}
            >
              <Text>Breathe</Text>
            </Pressable>
          </View>

          <Pressable style={styles.save} onPress={saveEntry}>
            <Text style={styles.saveText}>Save Mood</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  carousel: { height: 120, marginVertical: 16 },
  item: {
    width: width * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { transform: [{ scale: 1.2 }] },
  emoji: { fontSize: 32 },
  form: { flex: 1, padding: 16 },
  evo: { textAlign: 'center', fontSize: 20, marginVertical: 8 },
  label: { fontWeight: '600', marginTop: 12 },
  symptoms: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  sym: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    margin: 4,
  },
  symActive: { backgroundColor: theme.colors.primary },
  symText: {},
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestion: { fontStyle: 'italic', color: theme.colors.text.secondary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  btn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  save: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600' },
});