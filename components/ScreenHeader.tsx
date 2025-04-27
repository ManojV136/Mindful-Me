import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  RightComponent?: React.ReactNode;
}

export default function ScreenHeader({ 
  title, 
  subtitle, 
  onBack, 
  RightComponent 
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {onBack && (
          <Pressable 
            style={styles.backButton} 
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons 
              name="arrow-back" 
              size={24} 
              color={theme.colors.primary} 
            />
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
        {RightComponent && (
          <View style={styles.rightComponent}>
            {RightComponent}
          </View>
        )}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.primary}20`,
  },
  header: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    flex: 1,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  rightComponent: {
    marginLeft: theme.spacing.md,
  }
});