import React, { useState, useEffect } from 'react';
import { trackEvent } from '../utils/dashboardStorage';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const therapists = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Anxiety & Depression',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Stress Management',
    available: true,
  }
];

export default function SessionsScreen({ navigation }) {
  useEffect(() => { trackEvent('SessionsScreen'); }, []);
  const [sessions, setSessions] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

// Helper function to convert month name to number
const getMonthNumber = (monthName) => {
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  return months[monthName];
};

// Function to check if a date is in the past
const isDateInPast = (dateString) => {
  const [_, month, day] = dateString.split(' ');
  const date = new Date();
  date.setMonth(getMonthNumber(month));
  date.setDate(parseInt(day));
  date.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date < today;
};
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState('Video Call');

  useEffect(() => {
    loadSessions();
  }, []);  const loadSessions = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem('therapySessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions.filter(session => session.status !== 'cancelled'));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Error loading sessions');
    }
  };  const deleteSession = async (sessionId) => {
    try {
      const updatedSessions = sessions.filter(session => session.id !== sessionId);      await AsyncStorage.setItem('therapySessions', JSON.stringify(updatedSessions));
      await trackEvent('SessionsScreen', 'deleteSession');
      setSessions(updatedSessions);
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };  const handleBookSession = async () => {
    try {
      // Validate required fields
      if (!selectedTherapist || !selectedDate || !selectedTime || !selectedType) {
        toast.error('Please fill in all fields');
        return;
      }

      // Parse date components
      const [weekday, month, day] = selectedDate.split(' ');
      
      // Create date object for comparison
      const now = new Date();
      const selectedDateTime = new Date(now.getFullYear(), getMonthNumber(month), parseInt(day));
      
      // Parse time components and set hours
      const [timeStr, period] = selectedTime.split(' ');
      const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
      let bookingHour = hours;
      if (period === 'PM' && hours !== 12) bookingHour += 12;
      if (period === 'AM' && hours === 12) bookingHour = 0;
      
      selectedDateTime.setHours(bookingHour, minutes, 0, 0);

      // Validate future date/time
      if (selectedDateTime <= now) {
        toast.error('Please select a future time slot');
        return;
      }

      // Check for duplicate bookings
      const existingSessions = await AsyncStorage.getItem('therapySessions');
      const currentSessions = existingSessions ? JSON.parse(existingSessions) : [];
      
      const isDuplicate = currentSessions.some(session => 
        session.date === selectedDate && 
        session.time === selectedTime &&
        session.status !== 'cancelled'
      );

      if (isDuplicate) {
        toast.error('This time slot is already booked');
        return;
      }

      // Create new session
      const newSession = {
        id: Date.now().toString(),
        therapist: selectedTherapist.name,
        specialty: selectedTherapist.specialty,
        date: selectedDate,
        time: selectedTime,
        type: selectedType,
        status: 'upcoming',
        timestamp: selectedDateTime.getTime()
      };

      // Add to existing sessions and sort by date
      const updatedSessions = [...currentSessions, newSession].sort((a, b) => 
        new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
      );

      // Save to storage
      await AsyncStorage.setItem('therapySessions', JSON.stringify(updatedSessions));
      
      // Update local state
      setSessions(updatedSessions);

      // Track the event
      await trackEvent('SessionsScreen', 'bookSession');

      // Reset form and close booking view
      setSelectedTherapist(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedType('Video Call');
      setShowBooking(false);

      toast.success('Session booked successfully!');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={styles.title}>Therapy Sessions</Text>
        </View>        <View style={styles.actionButtons}>
          <Pressable 
            style={styles.bookButton} 
            onPress={() => setShowBooking(true)}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.bookButtonText}>Book New Session</Text>
          </Pressable>
        </View>

        {showBooking ? (
          <View style={styles.bookingForm}>
            <Text style={styles.formTitle}>Book a Session</Text>
            
            <View style={styles.therapistList}>
              {therapists.map(therapist => (
                <Pressable
                  key={therapist.id}
                  style={[
                    styles.therapistCard,
                    selectedTherapist?.id === therapist.id && styles.selectedTherapistCard
                  ]}
                  onPress={() => setSelectedTherapist(therapist)}
                >
                  <Text style={styles.therapistName}>{therapist.name}</Text>
                  <Text style={styles.therapistSpecialty}>{therapist.specialty}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.datePickerContainer}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>                {[...Array(14)].map((_, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() + index);
                  const dateString = date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });
                  
                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.dateOption,
                        selectedDate === dateString && styles.selectedDateOption,
                        isDateInPast(dateString) && styles.disabledDateOption
                      ]}
                      onPress={() => {
                        if (!isDateInPast(dateString)) {
                          setSelectedDate(dateString);
                        } else {
                          toast.error('Cannot select past dates');
                        }
                      }}
                    >
                      <Text style={[
                        styles.dateText,
                        selectedDate === dateString && styles.selectedDateText
                      ]}>
                        {dateString}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.timePickerContainer}>
              <Text style={styles.inputLabel}>Select Time</Text>              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(time => {
                  // Check if this time slot is in the past for today
                  const [timeStr, period] = time.split(' ');
                  const [hourStr] = timeStr.split(':');
                  let hour = parseInt(hourStr);
                  if (period === 'PM' && hour !== 12) hour += 12;
                  if (period === 'AM' && hour === 12) hour = 0;
                  
                  const now = new Date();
                  const isToday = selectedDate === now.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });
                  
                  const isPastTime = isToday && hour <= now.getHours();

                  return (
                    <Pressable
                      key={time}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.selectedTimeSlot,
                        isPastTime && styles.disabledTimeSlot
                      ]}
                      onPress={() => {
                        if (isPastTime) {
                          toast.error('Cannot book past time slots');
                        } else {
                          setSelectedTime(time);
                        }
                      }}
                    >
                      <Text style={[
                        styles.timeText,
                        selectedTime === time && styles.selectedTimeText,
                        isPastTime && styles.disabledTimeText
                      ]}>{time}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.typeContainer}>
              <Text style={styles.inputLabel}>Session Type</Text>
              <View style={styles.typeButtons}>
                {['Video Call', 'Audio Call'].map(type => (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeButton,
                      selectedType === type && styles.selectedTypeButton
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <MaterialIcons 
                      name={type === 'Video Call' ? 'videocam' : 'phone'} 
                      size={20} 
                      color={selectedType === type ? '#fff' : theme.colors.primary} 
                    />
                    <Text style={[
                      styles.typeButtonText,
                      selectedType === type && styles.selectedTypeButtonText
                    ]}>{type}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <Pressable 
                style={styles.cancelButton} 
                onPress={() => setShowBooking(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={styles.confirmButton}
                onPress={handleBookSession}
              >
                <Text style={styles.confirmButtonText}>Book Session</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            {sessions.length > 0 ? (
              sessions.map((session) => (                <View key={session.id} style={styles.sessionCard}>
                  <Pressable 
                    style={styles.deleteButton}
                    onPress={() => deleteSession(session.id)}
                  >
                    <MaterialIcons name="close" size={20} color="#ef4444" />
                  </Pressable>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionTherapist}>{session.therapist}</Text>
                    <View style={styles.typeTag}>
                      <MaterialIcons 
                        name={session.type === 'Video Call' ? 'videocam' : 'phone'} 
                        size={16} 
                        color={theme.colors.primary} 
                      />
                      <Text style={styles.typeTagText}>{session.type}</Text>
                    </View>
                  </View>
                  <View style={styles.sessionDetails}>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="event" size={20} color="#64748b" />
                      <Text style={styles.detailText}>{session.date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="access-time" size={20} color="#64748b" />
                      <Text style={styles.detailText}>{session.time}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noSessionsText}>No upcoming sessions</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.text.secondary}10`,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },  actionButtons: {
    margin: 20,
    gap: 12,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  clearButton: {
    backgroundColor: '#fee2e2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bookingForm: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    ...theme.colors.card.shadow,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 20,
  },
  therapistList: {
    marginBottom: 20,
    gap: 12,
  },
  therapistCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedTherapistCard: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  therapistSpecialty: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  dateOption: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedDateOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateText: {
    color: theme.colors.text.primary,
  },
  selectedDateText: {
    color: '#fff',
  },
  timePickerContainer: {
    marginBottom: 20,
  },  timeSlot: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  disabledDateOption: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    opacity: 0.5,
  },
  selectedTimeSlot: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },  timeText: {
    color: theme.colors.text.primary,
  },
  disabledTimeSlot: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    opacity: 0.5,
  },
  disabledTimeText: {
    color: '#94a3b8',
  },
  selectedTimeText: {
    color: '#fff',
  },
  typeContainer: {
    marginBottom: 20,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  selectedTypeButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  sessionsList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.colors.card.shadow,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTherapist: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  typeTagText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  sessionDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  noSessionsText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginTop: 20,
  },
});