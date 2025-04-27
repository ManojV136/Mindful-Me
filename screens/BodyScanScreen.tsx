import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { saveMeditationSession } from '../utils/dashboardStorage';
import { toast } from 'sonner-native';

export default function BodyScanScreen({ navigation }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const positionRef = useRef(0);
  const durationRef = useRef(876); // 14:36 in seconds

  useEffect(() => {
    loadAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://fnubpvtavzvepojdlgbn.supabase.co/storage/v1/object/public/mindful-full-body-scan/BreathworksBodyScan.mp3' },
        { progressUpdateIntervalMillis: 1000 },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Error loading audio:', error);
      toast.error('Failed to load meditation audio');
    }
  };

  const onPlaybackStatusUpdate = async (status) => {
    if (status.isLoaded) {
      positionRef.current = status.positionMillis / 1000;
      setProgress(status.positionMillis / (durationRef.current * 1000));
      
      if (status.didJustFinish) {
        setCompleted(true);
        setIsPlaying(false);
        handleSessionComplete();
      }
    }
  };

  const handleSessionComplete = async () => {
    try {
      await saveMeditationSession(durationRef.current, 'Body Scan');
      toast.success('Body scan completed! Wonderful job! 🌟');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      toast.error('Playback error occurred');
    }
  };

  const handleStop = async () => {
    if (!soundRef.current) return;

    try {      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      setIsPlaying(false);
      setProgress(0);
    } catch (error) {
      console.error('Error stopping playback:', error);
      toast.error('Error stopping session');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://api.a0.dev/assets/image?text=serene%20body%20relaxation%20nature%20minimal%20art%20soft%20colors&aspect=16:9' }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.title}>Body Scan</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              A gentle practice of bringing awareness to different parts of your body,
              promoting deep relaxation and mindfulness. Follow the guided instructions
              to scan your body from head to toe.
            </Text>

            {completed ? (
              <View style={styles.completionContainer}>
                <MaterialIcons name="check-circle" size={64} color={theme.colors.primary} />
                <Text style={styles.completionText}>Session Complete!</Text>
                <Text style={styles.completionSubtext}>
                  Wonderful job completing your body scan meditation. Feel the renewed energy in your body!
                </Text>
                <Pressable 
                  style={styles.doneButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.controls}>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: `${progress * 100}%` }]} />
                </View>
                
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>
                    {formatTime(positionRef.current)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(durationRef.current)}
                  </Text>
                </View>              <View style={styles.buttons}>
                <Pressable 
                  onPress={async () => {
                    if (!soundRef.current) return;
                    const status = await soundRef.current.getStatusAsync();
                    const newPosition = Math.max(0, status.positionMillis - 10000);
                    await soundRef.current.setPositionAsync(newPosition);
                  }} 
                  style={styles.controlButton}
                >
                  <MaterialIcons name="replay-10" size={32} color="#fff" />
                </Pressable>

                <Pressable onPress={handleStop} style={styles.controlButton}>
                  <MaterialIcons name="stop" size={32} color="#fff" />
                </Pressable>
                
                <Pressable onPress={togglePlayPause} style={[styles.controlButton, styles.playButton]}>
                  <MaterialIcons 
                    name={isPlaying ? "pause" : "play-arrow"} 
                    size={48} 
                    color="#fff" 
                  />
                </Pressable>

                <Pressable 
                  onPress={async () => {
                    if (!soundRef.current) return;
                    const status = await soundRef.current.getStatusAsync();
                    const newPosition = Math.min(durationRef.current * 1000, status.positionMillis + 10000);
                    await soundRef.current.setPositionAsync(newPosition);
                  }}
                  style={styles.controlButton}
                >
                  <MaterialIcons name="forward-10" size={32} color="#fff" />
                </Pressable>
              </View>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 32,
  },
  controls: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
  },
  completionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  completionSubtext: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});