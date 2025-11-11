import { useState, useRef, useEffect } from 'react';
import { Send, Save, User, MessageSquare, ArrowLeft, History, Plus, Trash2, Edit2, Check, X, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ChatMessage from './ChatMessage';
import TimetableGrid from './TimetableGrid';
import LoginModal from './LoginModal';
import PurchaseModal from './PurchaseModal';
import { toast } from 'sonner';
import { sendChatMessage, getChatHistory, deleteChatHistory, type ChatHistoryItem, type SendChatResponse, type ApiError } from '../lib/api';
import type { User as UserType } from '../App';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface TimeSlot {
  day: string;
  time: string;
  subject: string;
  room: string;
  credits: number;
  type: 'major' | 'general';
}

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const mapApiMessage = (item: ChatHistoryItem): Message => ({
  id: (item.id ?? generateId()).toString(),
  text: item.content ?? '',
  sender: item.role === 'assistant' || item.role === 'ai' ? 'ai' : 'user',
  timestamp: item.createdAt ? new Date(item.createdAt) : new Date(),
});

const buildSessionTitle = (messages: Message[]) => {
  const firstUserMessage = messages.find(message => message.sender === 'user');
  if (!firstUserMessage || !firstUserMessage.text) {
    return '새 대화';
  }
  return firstUserMessage.text.length > 30
    ? `${firstUserMessage.text.slice(0, 30)}...`
    : firstUserMessage.text;
};

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timetable: TimeSlot[];
  createdAt: Date;
  lastModifiedAt: Date;
}

interface ChatbotScreenProps {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile') => void;
  initialMessage?: string;
}

export default function ChatbotScreen({ user, setUser, navigate, initialMessage }: ChatbotScreenProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const updateSession = (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
    setSessions(prev => {
      let found = false;
      const updated = prev.map(session => {
        if (session.id === sessionId) {
          found = true;
          return updater(session);
        }
        return session;
      });
      if (!found) return prev;
      return updated.sort((a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime());
    });
  };

  const setActiveSession = (sessionId: string, messages: Message[]) => {
    setCurrentSessionId(sessionId);
    setMessages(messages);
  };

  const appendMessageToSession = (sessionId: string, message: Message) => {
    setSessions(prev => {
      const existing = prev.find(session => session.id === sessionId);
      const updatedSession: ChatSession = existing
        ? {
            ...existing,
            messages: [...existing.messages, message],
            lastModifiedAt: message.timestamp,
            title:
              existing.title === '새 대화' && message.sender === 'user' && message.text
                ? buildSessionTitle([...existing.messages, message])
                : existing.title,
          }
        : {
            id: sessionId,
            title:
              message.sender === 'user' && message.text
                ? buildSessionTitle([message])
                : '새 대화',
            messages: [message],
            timetable: [],
            createdAt: message.timestamp,
            lastModifiedAt: message.timestamp,
          };

      const others = existing ? prev.filter(session => session.id !== sessionId) : prev;
      return [updatedSession, ...others].sort(
        (a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime(),
      );
    });
  };

  const handleApiResponseMessages = (
    sessionId: string,
    response: SendChatResponse,
  ) => {
    const buckets: ChatHistoryItem[] = [];
    if (Array.isArray(response.messages)) buckets.push(...response.messages);
    if (Array.isArray(response.data)) buckets.push(...response.data);
    if (response.reply) buckets.push(response.reply);
    if (response.created) buckets.push(response.created);

    const aiMessages = buckets
      .filter(item => item.role !== 'user')
      .map(mapApiMessage)
      .filter(message => message.text);

    if (response.message && aiMessages.length === 0) {
      aiMessages.push({
        id: generateId(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
      });
    }

    if (aiMessages.length > 0) {
      setMessages(prev => [...prev, ...aiMessages]);
      updateSession(sessionId, session => ({
        ...session,
        messages: [...session.messages, ...aiMessages],
        lastModifiedAt: aiMessages[aiMessages.length - 1].timestamp,
      }));
    }

    if (response.conversationId && response.conversationId !== sessionId) {
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, id: response.conversationId }
            : session,
        ),
      );
      setCurrentSessionId(response.conversationId);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId) {
        setSessions([]);
        setMessages([]);
        setCurrentSessionId(null);
        return;
      }

      setIsHistoryLoading(true);
      try {
        const history = await getChatHistory(user.userId);

        if (!history || history.length === 0) {
          const newId = generateId();
          const now = new Date();
          const newSession: ChatSession = {
            id: newId,
            title: '새 대화',
            messages: [],
            timetable: [],
            createdAt: now,
            lastModifiedAt: now,
          };
          setSessions([newSession]);
          setActiveSession(newId, []);
          setTimetable([]);
          return;
        }

        const grouped = new Map<string, ChatHistoryItem[]>();
        history.forEach(item => {
          const key = item.conversationId ?? 'default';
          const list = grouped.get(key) ?? [];
          list.push(item);
          grouped.set(key, list);
        });

        const sessionList: ChatSession[] = Array.from(grouped.entries()).map(([key, items]) => {
          const mappedMessages = items
            .map(mapApiMessage)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          return {
            id: key,
            title: buildSessionTitle(mappedMessages),
            messages: mappedMessages,
            timetable: [],
            createdAt: mappedMessages[0]?.timestamp ?? new Date(),
            lastModifiedAt: mappedMessages[mappedMessages.length - 1]?.timestamp ?? new Date(),
          };
        });

        sessionList.sort((a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime());
        setSessions(sessionList);

        if (sessionList.length > 0) {
          setActiveSession(sessionList[0].id, sessionList[0].messages);
        } else {
          const newId = generateId();
          const now = new Date();
          const newSession: ChatSession = {
            id: newId,
            title: '새 대화',
            messages: [],
            timetable: [],
            createdAt: now,
            lastModifiedAt: now,
          };
          setSessions([newSession]);
          setActiveSession(newId, []);
        }
        setTimetable([]);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status === 401) {
          setShowLoginModal(true);
          toast.error('로그인이 필요합니다.');
        } else if (apiError.message) {
          toast.error(apiError.message);
        } else {
          toast.error('대화 기록을 불러오지 못했습니다.');
        }
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user?.userId, user?.email]);

  // Auto-save current session
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === currentSessionId
            ? {
                ...session,
                messages,
                timetable,
                lastModifiedAt: new Date(),
                title: session.title === '새 대화' && messages.length > 0 
                  ? messages[0].text.slice(0, 30) + (messages[0].text.length > 30 ? '...' : '')
                  : session.title
              }
            : session
        )
      );
    }
  }, [messages, timetable, currentSessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (
      initialMessage &&
      user?.userId &&
      !isHistoryLoading &&
      messages.length === 0
    ) {
      sendMessage(initialMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, user?.userId, isHistoryLoading]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!user.userId) {
      toast.error('사용자 정보를 불러오지 못했습니다.');
      return;
    }

    const sessionId = currentSessionId ?? generateId();
    const existingSession = sessions.find(session => session.id === sessionId);

    const userMessage: Message = {
      id: generateId(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    setInputValue('');
    setMessages(prev => [...prev, userMessage]);
    appendMessageToSession(sessionId, userMessage);
    setCurrentSessionId(sessionId);
    setIsSending(true);

    try {
      const response = await sendChatMessage({
        userId: user.userId,
        message: trimmed,
        conversationId:
          existingSession && existingSession.messages.length > 0
            ? sessionId
            : undefined,
      });

      handleApiResponseMessages(sessionId, response);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.message) {
        toast.error(apiError.message);
      } else {
        toast.error('메시지 전송 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = () => {
    if (isSending) return;
    sendMessage(inputValue);
  };

  const handleSave = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Check if user has reached free tier limit
    const currentPlan = user.plan || 'free';
    const currentCount = user.aiTimetablesCreated || 0;

    if (currentPlan === 'free' && currentCount >= 1) {
      setShowPurchaseModal(true);
      return;
    }

    // Increment timetable count
    setUser({
      ...user,
      aiTimetablesCreated: currentCount + 1,
    });

    toast.success('시간표가 성공적으로 저장되었습니다.');
  };

  const handleUpgradeToPremium = () => {
    if (user) {
      setUser({
        ...user,
        plan: 'premium',
      });
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate('profile');
  };

  const handleNewChat = () => {
    const newId = generateId();
    const now = new Date();
    const newSession: ChatSession = {
      id: newId,
      title: '새 대화',
      messages: [],
      timetable: [],
      createdAt: now,
      lastModifiedAt: now,
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
    setTimetable([]);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setTimetable(session.timetable);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        handleSelectSession(remainingSessions[0].id);
      } else {
        handleNewChat();
      }
    }
    toast.success('대화가 삭제되었습니다.');
  };

  const handleClearHistory = async () => {
    if (!user?.userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    try {
      await deleteChatHistory(user.userId);
      setSessions([]);
      setMessages([]);
      setTimetable([]);
      setCurrentSessionId(null);
      handleNewChat();
      toast.success('대화 기록이 모두 삭제되었습니다.');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.message) {
        toast.error(apiError.message);
      } else {
        toast.error('대화 기록 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleStartEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = () => {
    if (editingSessionId && editingTitle.trim()) {
      setSessions(prev => 
        prev.map(s => 
          s.id === editingSessionId 
            ? { ...s, title: editingTitle.trim() }
            : s
        )
      );
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  // Group sessions by date
  const groupSessionsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: { label: string; sessions: ChatSession[] }[] = [
      { label: '오늘', sessions: [] },
      { label: '어제', sessions: [] },
      { label: '지난 7일', sessions: [] },
      { label: '이전', sessions: [] },
    ];

    sessions.forEach(session => {
      const sessionDate = new Date(session.lastModifiedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === today.getTime()) {
        groups[0].sessions.push(session);
      } else if (sessionDate.getTime() === yesterday.getTime()) {
        groups[1].sessions.push(session);
      } else if (sessionDate >= weekAgo) {
        groups[2].sessions.push(session);
      } else {
        groups[3].sessions.push(session);
      }
    });

    return groups.filter(group => group.sessions.length > 0);
  };

  // Calculate credit statistics
  const calculateCredits = () => {
    const majorCredits = timetable
      .filter(slot => slot.type === 'major')
      .reduce((sum, slot) => sum + (slot.credits || 0), 0);
    
    const generalCredits = timetable
      .filter(slot => slot.type === 'general')
      .reduce((sum, slot) => sum + (slot.credits || 0), 0);
    
    const totalCredits = majorCredits + generalCredits;
    
    return { majorCredits, generalCredits, totalCredits };
  };

  const { majorCredits, generalCredits, totalCredits } = calculateCredits();

  return (
    <div className="h-screen flex flex-col relative bg-[#020103]">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('welcome')}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Menu className="size-5" />
          </Button>
          <div>
            <h1 className="text-white">AI 시간표 빌더</h1>
            <p className="text-white/60 text-sm mt-1">서경대학교</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/15"
          >
            <Save className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleProfileClick}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15"
          >
            <User className="size-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-64 flex flex-col bg-black/30 backdrop-blur-sm border-r border-white/10">
            <div className="p-4 border-b border-white/10 space-y-2">
              <Button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.5)]"
              >
                <Plus className="size-4 mr-2" />
                새 대화
              </Button>
              <Button
                variant="outline"
                onClick={handleClearHistory}
                className="w-full border-white/15 text-white/80 hover:text-white hover:bg-white/10"
              >
                <Trash2 className="size-4 mr-2" />
                기록 전체 삭제
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {groupSessionsByDate().map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <h3 className="text-xs text-white/40 px-3 uppercase tracking-wider">{group.label}</h3>
                  {group.sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative rounded-lg transition-all ${
                        session.id === currentSessionId
                          ? 'bg-white/15 border border-white/20'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {editingSessionId === session.id ? (
                        <div className="p-2 flex items-center gap-1">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                            className="h-7 text-sm bg-white/10 border-white/20 text-white"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleSaveTitle}
                            className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-white/10"
                          >
                            <Check className="size-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-white/10"
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSelectSession(session.id)}
                            className="w-full p-3 text-left"
                          >
                            <p className="text-sm text-white truncate pr-12">{session.title}</p>
                            <p className="text-xs text-white/40 mt-1">
                              {session.messages.length}개 메시지
                            </p>
                          </button>
                          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleStartEditTitle(session.id, session.title)}
                              className="h-6 w-6 text-white/60 hover:text-white hover:bg-white/20"
                            >
                              <Edit2 className="size-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteSession(session.id)}
                              className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center py-8 px-4">
                  <History className="size-12 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">
                    아직 대화가 없습니다<br />
                    새 대화를 시작해보세요
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Panel */}
        <div className={`flex flex-col bg-black/20 backdrop-blur-sm border-r border-white/10 ${showHistory ? 'w-1/3' : 'w-2/5'}`}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md px-4">
                  <div className="size-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(140,69,255,0.4)]">
                    <MessageSquare className="size-8 text-white" />
                  </div>
                  <h2 className="text-white">시간표 생성 시작</h2>
                  <p className="text-white/60 text-sm">
                    학년, 전공, 선호 시간대를 알려주시면<br />
                    AI가 최적의 시간표를 생성해드립니다
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 backdrop-blur-md bg-black/40">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="메시지 입력..."
                className="flex-1 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 px-4"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={isSending}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.5)] flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Timetable Panel */}
        <div className="flex-1 bg-black/30 backdrop-blur-sm p-6 overflow-hidden flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-white">생성된 시간표</h3>
            {timetable.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-purple-400">전공 {majorCredits}학점</span>
                <span className="text-blue-400">교양 {generalCredits}학점</span>
                <span className="text-white">총 {totalCredits}학점</span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <TimetableGrid timetable={timetable} />
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(user) => {
            setUser(user);
            setShowLoginModal(false);
          }}
        />
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <PurchaseModal
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handleUpgradeToPremium}
        />
      )}
    </div>
  );
}
