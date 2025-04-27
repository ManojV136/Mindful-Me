import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email: string) => {
    if (!email.trim()) return { isValid: false, message: 'Email is required' };
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true, message: '' };
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) return { isValid: false, message: 'Password is required' };
    return { isValid: true, message: '' };
  };  const handleLogin = async () => {
    try {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.message);
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data.user) {
        // Store basic user info
        await AsyncStorage.multiSet([
          ['userName', email.split('@')[0]],
          ['userEmail', email.trim()],
        ]);

        navigation.replace('Home');
        toast.success('Login successful!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed, please try again');
    }
  };  const useTestCredentials = () => {
    // Directly navigate to Home screen for demo
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://api.a0.dev/assets/image?text=minimalist%20meditation%20figure%20sitting%20cross%20legged%20simple%20line%20art%20mint%20green%20gradient&aspect=1:1&seed=123' }}
          style={styles.logo}
        />
        <Text style={styles.appName}>MindfulMe</Text>
        <Text style={styles.tagline}>Your Journey to Inner Peace</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.text.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable 
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? 'visibility-off' : 'visibility'} 
                size={24} 
                color="#64748b" 
              />
            </Pressable>
          </View>

          <Pressable 
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>

          <Pressable 
            style={styles.testButton} 
            onPress={useTestCredentials}
          >
            <Text style={styles.testButtonText}>Use Test Account</Text>
          </Pressable>

          <View style={styles.actionLinks}>
            <Pressable 
              style={styles.forgotPasswordButton}
              onPress={() => {
                if (!email.trim()) {
                  toast.error('Please enter your email first');
                  return;
                }
                toast.success('Password reset instructions sent! Check your email');
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <Pressable 
              style={styles.signupButton} 
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupButtonText}>
                Don't have an account? Sign Up
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 90,
  },
  appName: {
    ...theme.typography.appName,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  passwordToggle: {
    padding: 16,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  actionLinks: {
    marginTop: 16,
  },
  forgotPasswordButton: {
    padding: 12,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  signupButton: {
    padding: 12,
    alignItems: 'center',
  },
  signupButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
});