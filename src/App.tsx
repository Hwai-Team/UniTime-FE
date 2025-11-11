import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import WelcomeScreen from './components/WelcomeScreen';
import ChatbotScreen from './components/ChatbotScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import ProfileScreen from './components/ProfileScreen';
import ProfileEditScreen from './components/ProfileEditScreen';
import TimetableEditScreen from './components/TimetableEditScreen';
import { Toaster } from './components/ui/sonner';

export interface User {
  userId?: number;
  email: string;
  name: string;
  studentId: string;
  department: string;
  year: string;
  graduationYear?: string;
  plan?: 'free' | 'premium';
  aiTimetablesCreated?: number;
}

interface TimeSlot {
  day: string;
  time: string;
  subject: string;
  room: string;
  credits?: number;
  type?: 'major' | 'general';
  courseCode?: string;
  period?: string;
}

type Screen = 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile' | 'profileEdit' | 'timetableEdit';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [editingTimetable, setEditingTimetable] = useState<{ title: string; slots: TimeSlot[] } | null>(null);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleStartChat = (message: string) => {
    setInitialMessage(message);
    setCurrentScreen('chatbot');
  };

  const handleEditTimetable = (timetable: { title: string; slots: TimeSlot[] }) => {
    setEditingTimetable(timetable);
    setCurrentScreen('timetableEdit');
  };

  const handleSaveTimetable = (slots: TimeSlot[]) => {
    // Here you would typically save the timetable to your backend or state
    console.log('Saving timetable:', slots);
    setCurrentScreen('profile');
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-[#020103]">
        <Toaster />
        {currentScreen === 'welcome' && (
          <WelcomeScreen onStartChat={handleStartChat} navigate={navigate} user={user} />
        )}
        {currentScreen === 'chatbot' && (
          <ChatbotScreen user={user} setUser={setUser} navigate={navigate} initialMessage={initialMessage} />
        )}
        {currentScreen === 'login' && (
          <LoginScreen setUser={setUser} navigate={navigate} />
        )}
        {currentScreen === 'signup' && (
          <SignupScreen navigate={navigate} setUser={setUser} />
        )}
        {currentScreen === 'profile' && user && (
          <ProfileScreen 
            user={user} 
            setUser={setUser} 
            navigate={navigate}
            onEditTimetable={handleEditTimetable}
          />
        )}
        {currentScreen === 'profile' && !user && (
          <LoginScreen setUser={setUser} navigate={navigate} />
        )}
        {currentScreen === 'profileEdit' && user && (
          <ProfileEditScreen user={user} setUser={setUser} navigate={navigate} />
        )}
        {currentScreen === 'timetableEdit' && editingTimetable && (
          <TimetableEditScreen 
            timetable={editingTimetable}
            onSave={handleSaveTimetable}
            onCancel={() => navigate('profile')}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
