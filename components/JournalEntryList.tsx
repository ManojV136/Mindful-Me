import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function JournalEntryList({ entries, onPressEntry }) {
  return (
    <ScrollView style={styles.container}>      {entries.map((entry) => (
        <Pressable 
          key={entry.id} 
          style={styles.entryCard}
          onPress={() => onPressEntry(entry)}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{entry.title}</Text>          <Text style={styles.date}>{`${entry.date} at ${entry.time}`}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={2}>
            {entry.content}
          </Text>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color="#94a3b8" 
            style={styles.icon}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
  },
  preview: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    flex: 1,
  },
  icon: {
    marginLeft: 12,
  },
});