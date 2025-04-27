import React, { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { View, Text, StyleSheet, Pressable, Dimensions, ImageBackground, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function MeditationScreen({ navigation }) {
  // URIs for each guided session
  const BREATHING_URI = 'https://fnubpvtavzvepojdlgbn.supabase.co/storage/v1/object/public/audio/Breathing%20Exercises%20for%20Anxiety%20%20Mindful%20Breathing%20Meditation.mp3';
  const BODY_SCAN_URI = 'https://fnubpvtavzvepojdlgbn.supabase.co/storage/v1/object/public/mindful-full-body-scan/BreathworksBodyScan.mp3';

  const [sessionType, setSessionType] = useState<'breathing'|'body'>('breathing');
  const TOTAL_SECONDS = sessionType === 'breathing' ? 1028 : 876; // 17:08 and 14:36 respectively
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startSession = async () => {
    try {
      const uri = sessionType === 'breathing' ? BREATHING_URI : BODY_SCAN_URI;
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      soundRef.current = sound;
      setRunning(true);
    } catch (error) {
      console.error('Failed to load audio:', error);
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (soundRef.current) {
          soundRef.current.stopAsync();
          soundRef.current.unloadAsync();
        }
        setRunning(false);
        setSecondsLeft(TOTAL_SECONDS);
      };
    }, [])
  );  const handleSessionSelect = (type: 'breathing' | 'body') => {
    navigation.navigate(type === 'breathing' ? 'MindfulBreathing' : 'BodyScan');
  };

  const onEnd = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }
    setRunning(false);
    navigation.navigate('Home');
  };

  const format = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const sessionInfo = {
    breathing: {
      title: 'Mindful Breathing',
      duration: '17:08',
      description: 'A guided meditation focusing on breath awareness to reduce anxiety and promote relaxation.',
      image: 'https://api.a0.dev/assets/image?text=ethereal%20lotus%20flower%20floating%20in%20misty%20water%20zen%20garden%20peaceful%20meditation%20soft%20pastel%20colors&aspect=16:9'
    },
    body: {
      title: 'Body Scan',
      duration: '14:36',
      description: 'A gentle practice of bringing awareness to different parts of your body, promoting deep relaxation.',
      image: 'https://api.a0.dev/assets/image?text=silhouette%20of%20person%20meditating%20in%20nature%20with%20golden%20light%20rays%20peaceful%20minimal%20art%20soft%20colors&aspect=16:9'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Meditation</Text>
      </View>      <View style={styles.content}>
        <ScrollView style={styles.scrollView}>          {[
            {
              type: 'breathing',
              title: 'Mindful Breathing',
              duration: '17:08',
              image: 'https://api.a0.dev/assets/image?text=ethereal%20lotus%20flower%20floating%20in%20misty%20water%20zen%20garden%20peaceful%20meditation%20soft%20pastel%20colors&aspect=16:9'
            },
            {              type: 'relaxation',
              title: 'Relaxation Journey',
              duration: '14:36',
              image: 'https://api.a0.dev/assets/image?text=silhouette%20of%20person%20meditating%20in%20nature%20with%20golden%20light%20rays%20peaceful%20minimal%20art%20soft%20colors&aspect=16:9'
            }
          ].map((info) => (
            <Pressable
              key={info.type}
              style={styles.sessionCard}
              onPress={() => handleSessionSelect(info.type as 'breathing' | 'body')}
            >
              <ImageBackground
                source={{ uri: info.image }}
                style={styles.cardBackground}
                imageStyle={styles.cardImage}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{info.title}</Text>
                  <Text style={styles.cardDuration}>{info.duration}</Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.primary}10`,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sessionCards: {
    gap: theme.spacing.md,
  },  sessionCard: {
    height: 200,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.colors.card.shadow,
    marginBottom: 20,  // Added more space between cards
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabledCard: {
    opacity: 0.5,
  },
  cardBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardImage: {
    borderRadius: theme.borderRadius.lg,
  },
  cardContent: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardDuration: {
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    color: theme.colors.text.primary,
  },
  timerLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginTop: 'auto',
    marginBottom: theme.spacing.lg,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  stopButton: {
    backgroundColor: theme.colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});