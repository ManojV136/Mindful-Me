import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { theme } from '../utils/theme';

interface Props {
  userName: string;
}

export default function TalkingAvatar({ userName }: Props) {
  const [displayText, setDisplayText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;  const message = `Hi there! I'm your wellness companion`;
  
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Typewriter effect
    let currentText = '';
    const typeTimer = setInterval(() => {
      if (currentText.length < message.length) {
        currentText = message.slice(0, currentText.length + 1);
        setDisplayText(currentText);
      } else {
        clearInterval(typeTimer);
      }
    }, 35);

    return () => {
      clearInterval(typeTimer);
      Speech.stop();
    };
  }, [userName]);  // Start speaking when component mounts
  useEffect(() => {
    const startSpeaking = async () => {
      setIsSpeaking(true);
      try {
        await Speech.speak(message, {
          language: 'en',
          pitch: 1.1,
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (error) {
        setIsSpeaking(false);
      }
    };

    startSpeaking();
    return () => {
      Speech.stop();
    };
  }, [userName]); // Only re-run if userName changes

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: 'https://api.a0.dev/assets/image?text=friendly%20female%20cartoon%20avatar%20waving%20cute%20minimalist%20illustration%20mint%20green%20dress%20brown%20hair&aspect=1:1' }}
        style={[
          styles.avatar,
          { 
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.speechBubble, 
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.speechText}>{displayText}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({  container: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  avatar: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: -30,
  },
  speechBubble: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: -20,
    zIndex: 1,
  },
  speechText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  speakButton: {
    alignSelf: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
  },
});