export const theme = {
  colors: {
    primary: '#7C9D96',  // Sage green - calming and natural
    primaryLight: '#A5C0BE',
    secondary: '#E4BEB3', // Soft terracotta - warm and inviting
    accent: '#F2D8D5',   // Light pink - gentle highlight
    background: '#f8fafc',
    surface: '#ffffff',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      light: '#94a3b8'
    },
    card: {
      shadow: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999
  },
  typography: {
    appName: {
      fontSize: 32,
      fontFamily: 'System',
      fontWeight: '300',
      letterSpacing: 1,
      fontStyle: 'italic',
    },
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    }
  }
};