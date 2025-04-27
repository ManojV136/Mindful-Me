import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function ProfileScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);  const [email, setEmail] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [height, setHeight] = useState<string | null>(null);
  const [weight, setWeight] = useState<string | null>(null);  // Load stored profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        try {
          // load profile fields
          const pairs = await AsyncStorage.multiGet([
            'userAvatar',
            'userName',
            'userEmail',
            'userAge',
            'userHeight',
            'userWeight',
            'notifications',
            'privateAccount'
          ]);

          const data = Object.fromEntries(pairs);
          setAvatarUri(data.userAvatar || null);
          setName(data.userName || null);
          setEmail(data.userEmail || null);
          setAge(data.userAge || null);
          setHeight(data.userHeight || null);
          setWeight(data.userWeight || null);
          setNotifications(data.notifications === 'true');
          setPrivateAccount(data.privateAccount === 'true');
        } catch (error) {
          console.error('Error loading profile:', error);
          toast.error('Could not load profile data');
        }
      };

      loadProfileData();
    }, [])
  );

  // persist switch changes
  useEffect(() => {
    AsyncStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    AsyncStorage.setItem('privateAccount', JSON.stringify(privateAccount));
  }, [privateAccount]);
  async function changePhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Permission to access photos is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets.length) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem('userAvatar', uri);
      setAvatarUri(uri);
      toast.success('Profile photo updated');
    }
  }

  const settings = [
    {
      title: 'Account',
      items: [
        {
          icon: 'notifications',
          label: 'Notifications',
          isSwitch: true,
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: 'security',
          label: 'Privacy',
          isSwitch: true,
          value: privateAccount,
          onValueChange: setPrivateAccount,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Error logging out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={styles.title}>Profile Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                avatarUri ||
                'https://api.a0.dev/assets/image?text=peaceful%20profile%20avatar%20minimal%20art&aspect=1:1',
            }}
            style={styles.avatar}
          />          <Text style={styles.name}>{name || 'Your Name'}</Text>          <Text style={styles.email}>{email || 'you@example.com'}</Text>{/* Age/Height/Weight moved to Edit Profile only */}
          <View style={styles.photoActions}>
            <Pressable style={styles.changePhoto} onPress={changePhoto}>
              <MaterialIcons name="photo-camera" size={20} color={theme.colors.primary} />
              <Text style={styles.changePhotoText}>Edit Photo</Text>
            </Pressable>
            <Pressable style={styles.changePhoto} onPress={() => navigation.navigate('EditProfile')}>
              <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
              <Text style={styles.changePhotoText}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>

        {settings.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, idx) => (
              <Pressable
                key={idx}
                style={styles.settingItem}
                onPress={item.isSwitch ? undefined : item.onPress}
              >
                <View style={styles.settingLeft}>
                  <MaterialIcons name={item.icon} size={24} color={theme.colors.primary} />
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                {item.isSwitch ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: '#cbd5e1', true: theme.colors.primaryLight }}
                    thumbColor={item.value ? theme.colors.primary : '#f1f5f9'}
                  />
                ) : (
                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
                )}
              </Pressable>
            ))}
          </View>
        ))}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
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
    borderBottomColor: `${theme.colors.text.secondary}10`,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },  profileSection: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  profileField: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  changePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  changePhotoText: {
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '500',
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },  logoutText: {
    color: '#ef4444',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
});