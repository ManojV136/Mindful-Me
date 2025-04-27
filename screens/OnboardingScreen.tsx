import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

const onboardingSlides = [
  {
    id: 1,
    title: 'Welcome to MindfulMe',
    description: 'Your personal companion for mental wellness and inner peace',
    image: 'https://api.a0.dev/assets/image?text=peaceful%20meditation%20zen%20garden%20minimalist%20illustration&aspect=1:1',
  },
  {
    id: 2,
    title: 'Track Your Journey',
    description: 'Monitor your moods, journal your thoughts, and see your progress over time',
    image: 'https://api.a0.dev/assets/image?text=person%20climbing%20mountain%20growth%20journey%20minimalist&aspect=1:1',
  },
  {
    id: 3,
    title: 'Professional Support',
    description: 'Connect with licensed therapists and our AI wellness coach anytime, anywhere',    image: 'https://api.a0.dev/assets/image?text=gentle%20counseling%20session%20two%20silhouettes%20talking%20peaceful%20minimal%20art%20soft%20colors&aspect=1:1',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{ uri: onboardingSlides[currentSlide].image }}
          style={styles.image}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{onboardingSlides[currentSlide].title}</Text>
          <Text style={styles.description}>{onboardingSlides[currentSlide].description}</Text>
        </View>

        <View style={styles.dotsContainer}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index && styles.activeDot,
              ]}
            />
          ))}
        </View>        <View style={[
          styles.buttonsContainer,
          { justifyContent: currentSlide === onboardingSlides.length - 1 ? 'center' : 'space-between' }
        ]}>
          {currentSlide < onboardingSlides.length - 1 ? (
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
          ) : null}
          
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <MaterialIcons 
              name="arrow-forward" 
              size={24} 
              color="#fff" 
              style={styles.nextIcon} 
            />
          </Pressable>
        </View>
      </View>
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
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  image: {
    width: 280,
    height: 280,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryLight,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    marginTop: 'auto',
    marginBottom: theme.spacing.lg,
  },
  skipButton: {
    padding: theme.spacing.md,
  },
  skipButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  nextIcon: {
    marginLeft: theme.spacing.xs,
  },
});