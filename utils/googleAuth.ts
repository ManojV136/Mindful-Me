import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

export const useGoogleAuth = () => {
  // Note: replace with your actual CLIENT_ID from Google Cloud Console
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '<YOUR_EXPO_CLIENT_ID>',
    iosClientId: '<YOUR_IOS_CLIENT_ID>',
    androidClientId: '<YOUR_ANDROID_CLIENT_ID>',
    webClientId: '<YOUR_WEB_CLIENT_ID>',
  });

  const signIn = async () => {
    // Launch the Google auth flow
    await promptAsync();
  };

  const getUserInfo = async (token: string) => {
    // Fetch Google user info
    const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  };

  return { request, response, signIn, getUserInfo };
}