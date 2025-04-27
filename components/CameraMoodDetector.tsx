import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';  import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { toast } from 'sonner-native';

const MOOD_LABELS = ['Happy','Calm','Neutral','Worried','Sad'];

export default function CameraMoodDetector({ onDetect }) {
  const [hasPerm, setHasPerm] = useState<boolean|null>(null);
  const [cameraRef, setCameraRef] = useState<Camera|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPerm(status === 'granted');
      })();
    } else {
      // on web always "granted"
      setHasPerm(true);
    }
  }, []);

  const captureAndDetect = async (fileBase64?: string) => {
    setLoading(true);
    try {
      let base64: string;
      if (Platform.OS === 'web') {
        base64 = fileBase64!;
      } else {
        if (!cameraRef) {
          toast.error('Camera not ready');
          setLoading(false);
          return;
        }
        const photo = await cameraRef.takePictureAsync({ base64: true });
        base64 = photo.base64!;
      }
      const resp = await fetch('https://api.a0.dev/ai/llm', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          messages: [
            { role:'system', content: 'Identify the primary emotion in this image: happy, calm, neutral, worried, or sad.' },
            { role:'user', content: base64 }
          ]
        })
      });
      const { completion } = await resp.json();
      const label = MOOD_LABELS.find(m => completion.toLowerCase().includes(m.toLowerCase())) || 'Neutral';
      onDetect(label);
    } catch (e) {
      console.error(e);
      toast.error('Mood detection failed');
    } finally {
      setLoading(false);
    }
  };

  if (hasPerm === null) {
    return <View style={styles.center}><ActivityIndicator/></View>;
  }
  if (!hasPerm) {
    return <View style={styles.center}><Text>No camera permission</Text></View>;
  }  // Always use native camera + face detector

  // Native camera
  return (
    <View style={styles.container}>      <Camera
        style={styles.preview}
        ref={ref => setCameraRef(ref)}
        onFacesDetected={({ faces }) => {
          if (faces.length) {
            const face = faces[0];
            // send just the cropped face image
            cameraRef?.takePictureAsync({ base64: true, skipProcessing: true })
              .then(p => captureAndDetect(p.base64))
              .catch(() => {});
          }
        }}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
        }}
      />
      <Pressable
        style={styles.button}
        onPress={() => captureAndDetect()}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff"/>
          : <Text style={styles.btnText}>Snap & Detect</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width:'100%', height:300, overflow:'hidden', borderRadius:12, marginBottom:20, justifyContent:'center', alignItems:'center' },
  preview: { flex:1, width:'100%' },
  button: { position:'absolute', bottom:10, alignSelf:'center', backgroundColor:'#6366f1', padding:12, borderRadius:8 },
  btnText: { color:'#fff', fontWeight:'600' },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  webInput: {
    width: '80%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    cursor: 'pointer'
  }
});