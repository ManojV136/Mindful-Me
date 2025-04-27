import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { supabase } from '../utils/supabase';
import ScreenHeader from '../components/ScreenHeader';

export default function MoodLogsScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data);
    } catch (error) {
      console.error('Error loading mood logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.logItem}
      onPress={() => setSelectedLog(item)}
    >
      <View style={styles.logHeader}>
        <Text style={styles.emoji}>{item.mood}</Text>
        <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
      </View>
      
      <Text style={styles.moodLabel}>{item.mood_label}</Text>
      
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensity:</Text>
        <View style={styles.intensityBar}>
          <View
            style={[
              styles.intensityFill,
              { width: `${(item.intensity / 10) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.intensityValue}>{item.intensity}</Text>
      </View>

      {item.symptoms.length > 0 && (
        <View style={styles.symptoms}>
          {item.symptoms.map((symptom, index) => (
            <View key={index} style={styles.symptomChip}>
              <Text style={styles.symptomText}>{symptom}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.reflection} numberOfLines={2}>
        {item.reflection_text}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Mood History"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              No mood entries yet. Start tracking your moods!
            </Text>
          )
        }
      />

      <Modal
        visible={!!selectedLog}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedLog(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedLog(null)}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
            </Pressable>
            <Text style={styles.modalTitle}>Mood Details</Text>
          </View>

          {selectedLog && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalEmoji}>{selectedLog.mood}</Text>
                <Text style={styles.modalMoodLabel}>{selectedLog.mood_label}</Text>
                <Text style={styles.modalTimestamp}>
                  {formatDate(selectedLog.created_at)}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Intensity</Text>
                <View style={styles.modalIntensityBar}>
                  <View
                    style={[
                      styles.modalIntensityFill,
                      { width: `${(selectedLog.intensity / 10) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.modalIntensityValue}>
                  {selectedLog.intensity} / 10
                </Text>
              </View>

              {selectedLog.symptoms.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Symptoms</Text>
                  <View style={styles.modalSymptoms}>
                    {selectedLog.symptoms.map((symptom, index) => (
                      <View key={index} style={styles.modalSymptomChip}>
                        <Text style={styles.modalSymptomText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Reflection</Text>
                <Text style={styles.modalReflection}>
                  {selectedLog.reflection_text}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Suggestion</Text>
                <Text style={styles.modalSuggestion}>
                  {selectedLog.suggestion_text}
                </Text>
              </View>

              {selectedLog.quote_text && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalQuote}>
                    {selectedLog.quote_text}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.colors.card.shadow,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
  },
  timestamp: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  intensityLabel: {
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  intensityBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    marginRight: 8,
  },
  intensityFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  intensityValue: {
    color: theme.colors.text.secondary,
    width: 24,
    textAlign: 'right',
  },
  symptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  symptomChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  symptomText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  reflection: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginTop: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  modalContent: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMoodLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalTimestamp: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  modalIntensityBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 8,
  },
  modalIntensityFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  modalIntensityValue: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  modalSymptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSymptomChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalSymptomText: {
    color: theme.colors.text.secondary,
  },
  modalReflection: {
    color: theme.colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
  },
  modalSuggestion: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  modalQuote: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});