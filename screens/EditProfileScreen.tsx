import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { toast } from 'sonner-native';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    (async () => {
      const pairs = await AsyncStorage.multiGet([
        'userName',
        'userEmail',
        'userAge',
        'userHeight',
        'userWeight'
      ]);
      const data = Object.fromEntries(pairs);
      if (data.userName) setName(data.userName);
      if (data.userEmail) setEmail(data.userEmail);
      if (data.userAge) setAge(data.userAge);
      if (data.userHeight) setHeight(data.userHeight);
      if (data.userWeight) setWeight(data.userWeight);
    })();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email cannot be blank');
      return;
    }
    await AsyncStorage.multiSet([
      ['userName', name.trim()],
      ['userEmail', email.trim()],
      ['userAge', age.trim()],
      ['userHeight', height.trim()],
      ['userWeight', weight.trim()]
    ]);
    toast.success('Profile updated!');
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={styles.title}>Edit Profile</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 30"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 170"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 65"
            keyboardType="numeric"
          />

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  back: {
    marginRight: theme.spacing.md
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text.primary
  },
  form: {
    padding: theme.spacing.lg
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: 4
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: theme.spacing.lg
  },
  saveText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600'
  }
});