import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, Platform, View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { trackEvent } from '../utils/dashboardStorage';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function WellnessCoach() {
  const [message, setMessage] = useState('');  const [messages, setMessages] = useState<Message[]>([]);
  // wrap in KeyboardAvoidingView so input stays above keyboard

  // Load chat history on mount
  useEffect(() => {
    const loadMessages = async () => {      try {
        const savedMessages = await AsyncStorage.getItem('chatHistory');
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } else {
          // Set initial message if no history
          setMessages([{
            id: '1',
            content: "Hello! I'm your AI Wellness Coach. How can I support your mental well-being today?",
            sender: 'ai',
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem('chatHistory', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    };
    if (messages.length > 0) {
      saveMessages();
    }
  }, [messages]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);    try {
      // Track the user message
      await trackEvent('AIChat', 'sendMessage');
      
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an empathetic and professional mental wellness coach. Your responses should be:
              1. Supportive and encouraging
              2. Based on positive psychology principles
              3. Focused on practical solutions
              4. Brief but meaningful (50-100 words)
              5. Never provide medical advice
              6. Use emojis occasionally for warmth
              
              Current conversation context: ${messages.slice(-3).map(m => m.content).join(' | ')}`,
            },
            {
              role: 'user',
              content: message,
            },
          ],
        }),
      });

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.completion,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Wellness Coach</Text>
        <Text style={styles.subtitle}>Get supportive guidance 24/7</Text>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageBox,
              msg.sender === 'user' ? styles.userMessage : styles.aiMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText
            ]}>
              {msg.content}
            </Text>
            <Text style={styles.timestamp}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageBox, styles.aiMessage]}>
            <Text style={styles.typingIndicator}>typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <Pressable 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <MaterialIcons 
            name="send" 
            size={24} 
            color={message.trim() ? "#fff" : "#94a3b8"} 
          />        </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    height: 500,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageBox: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#1e293b',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    minHeight: 45,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
});