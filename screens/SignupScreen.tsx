import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = () => {
    // For now, just show a message that Google Sign-in is coming soon
    toast.info('Google Sign-in coming soon!');
  };  const handleEmailSignUp = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          }
        }
      });

      if (error) throw error;

      if (data) {
        // Store user info locally for quick access
        await AsyncStorage.multiSet([
          ['userName', `${firstName.trim()} ${lastName.trim()}`],
          ['userEmail', email.trim()],
        ]);
        
        navigation.replace('Home');
        toast.success('Welcome to MindfulMe! Please check your email to verify your account.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
      console.error('Signup error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Create a FREE Account</Text>
        <Pressable 
          style={({ pressed }) => [
            styles.socialButton,
            pressed && styles.socialButtonPressed
          ]}
          onPress={handleGoogleSignIn}
        >
          <View style={styles.socialButtonContent}>
            <Image 
              source={{ uri: 'https://api.a0.dev/assets/image?text=google%20g%20logo%20simple&aspect=1:1' }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Sign in with Google</Text>
          </View>
        </Pressable>

        <Text style={styles.divider}>or Register with Email</Text>
        <View style={styles.form}>          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={theme.colors.text.secondary}
            value={firstName}
            onChangeText={setFirstName}
          />
          <View style={styles.inputSpacing} />          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor={theme.colors.text.secondary}
            value={lastName}
            onChangeText={setLastName}
          />          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>            <TextInput
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
          
          <Pressable style={styles.signupButton} onPress={handleEmailSignUp}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </Pressable>

          <Pressable 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              Already have an account? Sign In
            </Text>
          </Pressable>
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
    alignItems: 'stretch',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 32,
    textAlign: 'center',
  },
  socialButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  socialButtonPressed: {
    backgroundColor: '#f8fafc',
    transform: [{ scale: 0.98 }],
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  divider: {
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputSpacing: {
    height: 16,
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
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 16,
  },
  signupButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    padding: 8,
  },
  loginButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
});