import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Save, User, MessageSquare, ArrowLeft, Menu, Loader2, History } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ChatMessage from './ChatMessage';
import TimetableGrid from './TimetableGrid';
import LoginModal from './LoginModal';
import PurchaseModal from './PurchaseModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import {
  sendChatMessage,
  getChatHistory,
  deleteChatHistory,
  createAiTimetable,
  saveAiTimetable,
  getAiTimetables,
  deleteAiTimetables,
  type ChatHistoryItem,
  type SendChatResponse,
  type AiTimetableItem,
  type SavedAiTimetableEntry,
  type ApiError,
} from '../lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
  courseCode?: string;
}

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isGeneratingTimetable, setIsGeneratingTimetable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastGeneratedTimetableId, setLastGeneratedTimetableId] = useState<number | null>(null);
  const [lastGeneratedSummary, setLastGeneratedSummary] = useState<string>('');
  const [savedAiTimetables, setSavedAiTimetables] = useState<SavedAiTimetableEntry[]>([]);
  const [isSavedTimetablesLoading, setIsSavedTimetablesLoading] = useState(false);
  const [isDeletingSavedTimetables, setIsDeletingSavedTimetables] = useState(false);
  const [isSavedDialogOpen, setIsSavedDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);
  const sessionsRef = useRef<ChatSession[]>([]);
  const startNewLocalSession = useCallback(
    (title = '새 대화') => {
      const now = Date.now();
      const sessionId = `local-${now}`;
      const timestamp = new Date();
      const newSession: ChatSession = {
        id: sessionId,
        title,
        messages: [],
        timetable: [],
        createdAt: timestamp,
        lastModifiedAt: timestamp,
      };

      setSessions(prev => {
        const updated = [newSession, ...prev];
        sessionsRef.current = updated;
        return updated;
      });
      setConversationId(null);
      setCurrentSessionId(sessionId);
      setMessages([]);
      setTimetable([]);
      setInputValue('');
      setLastGeneratedTimetableId(null);
      setLastGeneratedSummary('');
      return sessionId;
    },
    [],
  );
  const currentYear = new Date().getFullYear();
  const defaultSemester = new Date().getMonth() < 6 ? 1 : 2;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSemester, setSelectedSemester] = useState<number>(defaultSemester);
  const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);
  const semesterOptions = [1, 2];

  const mapHistoryItemToMessage = (item: ChatHistoryItem): Message => {
    const normalizedRole = item.role?.toLowerCase();
    const sender: Message['sender'] =
      normalizedRole === 'user' ? 'user' : 'ai';

    return {
      id: String(
        item.id ?? `${item.conversationId ?? 'session'}-${item.createdAt}`,
      ),
      text: item.content,
      sender,
      timestamp: new Date(item.createdAt),
    };
  };

  const buildSessionsFromHistory = (history: ChatHistoryItem[]): ChatSession[] => {
    const grouped = history.reduce<Record<string, ChatHistoryItem[]>>((acc, item) => {
      const key =
        item.conversationId !== undefined && item.conversationId !== null
          ? String(item.conversationId)
          : 'default';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([id, items]) => {
        const sorted = [...items].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        const messagesForSession = sorted.map(mapHistoryItemToMessage);
        const firstUserMessage = sorted.find(entry => entry.role === 'user');
        const baseTitle = firstUserMessage?.content ?? '새 대화';
        const title =
          baseTitle.length > 30 ? `${baseTitle.slice(0, 30)}...` : baseTitle;

        return {
          id,
          title,
          messages: messagesForSession,
        timetable: [],
          createdAt: new Date(sorted[0].createdAt),
          lastModifiedAt: new Date(sorted[sorted.length - 1].createdAt),
        } satisfies ChatSession;
      })
      .sort(
        (a, b) =>
          new Date(b.lastModifiedAt).getTime() -
          new Date(a.lastModifiedAt).getTime(),
      );
  };

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  const loadChatHistory = useCallback(
    async (preferredConversationId?: string | null) => {
      if (!user?.userId) {
        return;
      }

      setIsHistoryLoading(true);
      try {
        const history = await getChatHistory(user.userId);

        if (!history || history.length === 0) {
          sessionsRef.current = [];
          setSessions([]);
          setMessages([]);
          setTimetable([]);
          setConversationId(null);
          setCurrentSessionId(null);
          return;
        }

        const sessionList = buildSessionsFromHistory(history);
        const timetableMap = new Map(
          sessionsRef.current.map(session => [session.id, session.timetable]),
        );
        const mergedSessions = sessionList.map(session => ({
          ...session,
          timetable: timetableMap.get(session.id) ?? session.timetable,
        }));

        const serverIds = new Set(mergedSessions.map(session => session.id));
        const localOnlySessions = sessionsRef.current.filter(
          session => !serverIds.has(session.id),
        );
        const combinedSessions = [...mergedSessions, ...localOnlySessions].sort(
          (a, b) =>
            new Date(b.lastModifiedAt).getTime() -
            new Date(a.lastModifiedAt).getTime(),
        );

        sessionsRef.current = combinedSessions;
        setSessions(combinedSessions);

        let nextConversationId: string | null;
        if (preferredConversationId !== undefined) {
          nextConversationId = preferredConversationId;
        } else if (
          conversationId &&
          combinedSessions.some(session => session.id === conversationId)
        ) {
          nextConversationId = conversationId;
        } else if (
          currentSessionId &&
          combinedSessions.some(session => session.id === currentSessionId)
        ) {
          nextConversationId = currentSessionId;
        } else {
          nextConversationId = combinedSessions[0]?.id ?? null;
        }

        if (
          nextConversationId &&
          !combinedSessions.some(session => session.id === nextConversationId)
        ) {
          nextConversationId = combinedSessions[0]?.id ?? null;
        }

        setConversationId(nextConversationId ?? null);
        setCurrentSessionId(nextConversationId ?? null);

        const activeSession = nextConversationId
          ? combinedSessions.find(session => session.id === nextConversationId)
          : undefined;
        setMessages(activeSession?.messages ?? []);
      } catch (error) {
        console.error(error);
        const apiError = error as ApiError;
        toast.error(
          apiError?.message ?? '채팅 기록을 불러오는 중 오류가 발생했습니다.',
        );
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [user?.userId, conversationId, currentSessionId],
  );

  const resolveConversationIdFromResponse = (response: SendChatResponse): string | null => {
    const candidate =
      response.conversationId ??
      response.reply?.conversationId ??
      response.created?.conversationId ??
      response.messages?.[0]?.conversationId ??
      response.data?.[0]?.conversationId;

    if (
      candidate === undefined ||
      candidate === null ||
      candidate === ''
    ) {
      return null;
    }

    return String(candidate);
  };

  const DAY_LABEL_MAP: Record<string, string> = {
    MON: '월',
    TUE: '화',
    WED: '수',
    THU: '목',
    FRI: '금',
    SAT: '토',
    SUN: '일',
  };

  const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];
  const dayOrderMap = new Map(DAY_ORDER.map((day, index) => [day, index]));

  const convertAiTimetableItems = (items: AiTimetableItem[]) => {
    const slots: TimeSlot[] = [];

    items.forEach(item => {
      const day = DAY_LABEL_MAP[item.dayOfWeek] ?? item.dayOfWeek ?? '';
      if (!day) return;

      const start = Number.isFinite(item.startPeriod) ? item.startPeriod : 0;
      const end = Number.isFinite(item.endPeriod) ? item.endPeriod : start + 1;
      const duration = Math.max(1, end - start);
      const sanitizedRoom =
        item.room && item.room !== 'null' ? item.room : '';
      const category = (item.category ?? '').toUpperCase();
      const slotType: TimeSlot['type'] =
        category === 'MAJOR' ? 'major' : 'general';

      for (let offset = 0; offset < duration; offset++) {
        const period = start + offset;
        const clampedPeriod = Number.isFinite(period) ? period : 9 + offset;
        const timeLabel = `${String(clampedPeriod).padStart(2, '0')}:00`;

        slots.push({
          day,
          time: timeLabel,
          subject: item.courseName,
          room: sanitizedRoom,
          type: slotType,
          courseCode: item.courseName,
          credits: offset === 0 ? duration : 0,
        });
      }
    });

    return slots.sort((a, b) => {
      const dayDiff =
        (dayOrderMap.get(a.day) ?? 99) - (dayOrderMap.get(b.day) ?? 99);
      if (dayDiff !== 0) {
        return dayDiff;
      }
      return a.time.localeCompare(b.time);
    });
  };

  const loadSavedTimetables = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.userId) {
        setSavedAiTimetables([]);
        return;
      }
      if (!options?.silent) {
        setIsSavedTimetablesLoading(true);
      }
      try {
        const data = await getAiTimetables(user.userId);
        setSavedAiTimetables(data);
      } catch (error) {
        console.error(error);
        const apiError = error as ApiError;
        if (!options?.silent) {
          toast.error(
            apiError?.message ?? '저장된 AI 시간표를 불러오는 중 오류가 발생했습니다.',
          );
        }
      } finally {
        if (!options?.silent) {
          setIsSavedTimetablesLoading(false);
        }
      }
    },
    [user?.userId],
  );

  useEffect(() => {
    if (!user?.userId) {
      setSessions([]);
      setMessages([]);
      setConversationId(null);
      setCurrentSessionId(null);
      setTimetable([]);
      return;
    }
    loadChatHistory();
  }, [user?.userId, loadChatHistory]);

  useEffect(() => {
    if (user?.userId) {
      void loadSavedTimetables({ silent: true });
    } else {
      setSavedAiTimetables([]);
    }
  }, [user?.userId, loadSavedTimetables]);

  useEffect(() => {
    if (isSavedDialogOpen) {
      void loadSavedTimetables();
    }
  }, [isSavedDialogOpen, loadSavedTimetables]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessageToApi = useCallback(
    async (
      text: string,
      options?: { sessionId?: string; newConversation?: boolean },
    ): Promise<{ response: SendChatResponse | null; conversationId: string | null } | null> => {
      const trimmed = text.trim();
      if (!trimmed) return null;

      if (!user?.userId) {
        toast.error('로그인이 필요합니다.');
        setShowLoginModal(true);
        return null;
      }

      const now = Date.now();

      const tempMessage: Message = {
        id: `${now}`,
        text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

      const providedSessionId = options?.sessionId;
      const isNewConversation = options?.newConversation ?? false;
      const generatedSessionId = `local-${now}`;
      const activeSessionId =
        providedSessionId ??
        currentSessionId ??
        (isNewConversation ? null : conversationId) ??
        generatedSessionId;

      if (isNewConversation || (!currentSessionId && !conversationId)) {
        setCurrentSessionId(activeSessionId);
      }

      setMessages(prev => [...prev, tempMessage]);

      setSessions(prevSessions => {
        const existingIndex = prevSessions.findIndex(
          session => session.id === activeSessionId,
        );

        const baseSession =
          existingIndex >= 0
            ? prevSessions[existingIndex]
            : {
                id: activeSessionId,
                title: '새 대화',
                messages: [],
                timetable: [],
                createdAt: new Date(),
                lastModifiedAt: new Date(),
              };

        const updatedMessages = [...baseSession.messages, tempMessage];
        const firstUserMessage = updatedMessages.find(
          message => message.sender === 'user',
        );
        const derivedTitle =
          firstUserMessage?.text?.trim() || baseSession.title || '새 대화';
        const truncatedTitle =
          derivedTitle.length > 30
            ? `${derivedTitle.slice(0, 30)}...`
            : derivedTitle;

        const updatedSession: ChatSession = {
          ...baseSession,
          id: activeSessionId,
          title: truncatedTitle,
          messages: updatedMessages,
          lastModifiedAt: new Date(),
        };

        const remainingSessions =
          existingIndex >= 0
            ? [
                ...prevSessions.slice(0, existingIndex),
                ...prevSessions.slice(existingIndex + 1),
              ]
            : prevSessions;

        const updatedList = [updatedSession, ...remainingSessions];
        sessionsRef.current = updatedList;
        return updatedList;
      });

      setIsSending(true);

      let nextConversationId: string | null =
        (isNewConversation ? null : conversationId) ??
        activeSessionId ??
        null;

      try {
        const response = await sendChatMessage({
          userId: user.userId,
          message: trimmed,
          conversationId: isNewConversation
            ? undefined
            : conversationId ?? undefined,
        });

        const resolvedConversationId =
          resolveConversationIdFromResponse(response) ?? null;

        if (resolvedConversationId) {
          nextConversationId = resolvedConversationId;
        }

        if (nextConversationId) {
          setConversationId(nextConversationId);
          setCurrentSessionId(nextConversationId);
        }

        if (response.reply) {
          const aiMessage = mapHistoryItemToMessage(response.reply);
          setMessages(prev => {
            if (prev.some(message => message.id === aiMessage.id)) {
              return prev;
            }
            return [...prev, aiMessage];
          });
        }

        await loadChatHistory(nextConversationId);
        return { response, conversationId: nextConversationId };
      } catch (error) {
        console.error(error);
        const apiError = error as ApiError;
        toast.error(
          apiError?.message ?? '메시지를 전송하는 중 오류가 발생했습니다.',
        );
        await loadChatHistory(nextConversationId);
        return { response: null, conversationId: nextConversationId };
      } finally {
        setIsSending(false);
      }
    },
    [user?.userId, conversationId, currentSessionId, loadChatHistory],
  );

  useEffect(() => {
    if (!initialMessage || initialMessageSentRef.current) return;
    if (!user?.userId) {
      setInputValue(initialMessage);
      initialMessageSentRef.current = true;
      return;
    }

    initialMessageSentRef.current = true;
    const sessionId = startNewLocalSession();
    void sendMessageToApi(initialMessage, {
      sessionId,
      newConversation: true,
    });
  }, [initialMessage, user?.userId, startNewLocalSession, sendMessageToApi]);

  const handleSendMessage = async () => {
    if (isSending || !inputValue.trim()) return;

    if (!user?.userId) {
      toast.error('로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }

    const currentInput = inputValue;
    setInputValue('');
    await sendMessageToApi(currentInput);
  };

  const handleGenerateTimetable = async () => {
    if (isGeneratingTimetable || isSending) return;

    const trimmed = inputValue.trim();
    if (!trimmed) {
      toast.error('시간표를 생성할 메시지를 입력해주세요.');
      return;
    }

    if (!user?.userId) {
      toast.error('로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }

    setIsGeneratingTimetable(true);
    const messageText = trimmed;
    setInputValue('');

    try {
      const sendResult = await sendMessageToApi(messageText);
      const activeConversationId =
        sendResult?.conversationId ??
        conversationId ??
        currentSessionId ??
        null;

      const aiTimetable = await createAiTimetable({
        userId: user.userId,
        message: messageText,
        year: selectedYear,
        semester: selectedSemester,
      });

      const convertedTimetable = convertAiTimetableItems(aiTimetable.items ?? []);
      setTimetable(convertedTimetable);
      setLastGeneratedTimetableId(aiTimetable.id ?? null);
      const summaryFallback =
        aiTimetable.resultSummary?.trim() ||
        aiTimetable.title?.trim() ||
        messageText ||
        `생성된 시간표 (${selectedYear}년 ${selectedSemester}학기)`;
      setLastGeneratedSummary(summaryFallback);

      if (activeConversationId) {
        setSessions(prevSessions => {
          const updated = prevSessions.map(session => {
            if (session.id !== activeConversationId) {
              return session;
            }

            const newTitle =
              session.title === '새 대화' && aiTimetable.title
                ? aiTimetable.title.length > 30
                  ? `${aiTimetable.title.slice(0, 30)}...`
                  : aiTimetable.title
                : session.title;

    return {
              ...session,
              title: newTitle,
              timetable: convertedTimetable,
              lastModifiedAt: new Date(),
            };
          });
          sessionsRef.current = updated;
          return updated;
        });
      }

      if (convertedTimetable.length === 0) {
        toast.info('시간표가 생성되었지만 표시할 항목이 없습니다.');
      } else {
        toast.success('AI 시간표가 생성되었습니다.');
      }
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      toast.error(
        apiError?.message ?? 'AI 시간표를 생성하는 중 오류가 발생했습니다.',
      );
      setLastGeneratedTimetableId(null);
      setLastGeneratedSummary('');
    } finally {
      setIsGeneratingTimetable(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!user.userId) {
      toast.error('사용자 정보가 올바르지 않습니다.');
      return;
    }

    if (lastGeneratedTimetableId == null) {
      toast.error('저장할 AI 시간표가 없습니다. 먼저 생성해주세요.');
      return;
    }
    const timetableId = lastGeneratedTimetableId;

    // Check if user has reached free tier limit
    const currentPlan = user.plan || 'free';
    const currentCount = user.aiTimetablesCreated || 0;

    if (currentPlan === 'free' && currentCount >= 1) {
      setShowPurchaseModal(true);
      return;
    }

    setIsSaving(true);
    try {
      await saveAiTimetable({
        userId: user.userId,
        timetableId,
        resultSummary:
          lastGeneratedSummary?.trim() ||
          `AI 시간표 (${selectedYear}년 ${selectedSemester}학기)`,
      });

      setUser({
        ...user,
        aiTimetablesCreated: currentCount + 1,
      });

      toast.success('AI 시간표가 성공적으로 저장되었습니다.');
      void loadSavedTimetables({ silent: true });
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      toast.error(
        apiError?.message ?? 'AI 시간표를 저장하는 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
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

  const handleClearHistory = async () => {
    if (!user?.userId) {
      toast.error('로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }

    const confirmMessage = '모든 대화 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.';
    if (typeof window !== 'undefined' && !window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteChatHistory(user.userId);
      sessionsRef.current = [];
      setSessions([]);
      setMessages([]);
      setTimetable([]);
      setConversationId(null);
      setCurrentSessionId(null);
      setLastGeneratedTimetableId(null);
      setLastGeneratedSummary('');
      void loadSavedTimetables({ silent: true });
      toast.success('대화 기록이 모두 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      toast.error(apiError?.message ?? '대화 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSavedTimetables = async () => {
    if (!user?.userId) {
      toast.error('로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.confirm('저장된 AI 시간표를 모두 삭제하시겠습니까?')
    ) {
      return;
    }

    setIsDeletingSavedTimetables(true);
    try {
      await deleteAiTimetables(user.userId);
      setSavedAiTimetables([]);
      toast.success('저장된 AI 시간표가 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      toast.error(
        apiError?.message ?? '저장된 AI 시간표를 삭제하는 중 오류가 발생했습니다.',
      );
    } finally {
      setIsDeletingSavedTimetables(false);
    }
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
            onClick={() => setIsSavedDialogOpen(true)}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/15"
          >
            <History className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={isSaving || !lastGeneratedTimetableId}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                  onClick={handleClearHistory}
                  className="w-full border border-red-500/40 text-red-400 hover:text-white hover:bg-red-500/30"
                  disabled={isHistoryLoading || isSending || sessions.length === 0}
                          >
                  대화 초기화
                          </Button>
                          <Button
                  onClick={() => navigate('welcome')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_18px_rgba(129,80,255,0.45)]"
                >
                  선배들의 시간표 참고하기
                            </Button>
                          </div>
            </div>
            
            <div className="flex-1" />
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
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
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
                <Button
                  onClick={handleGenerateTimetable}
                  disabled={
                    isSending || isGeneratingTimetable || !inputValue.trim()
                  }
                  className="rounded-xl border border-purple-500/40 bg-purple-600/30 hover:bg-purple-600/40 text-white flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingTimetable ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  <span className="text-sm">AI 시간표 생성</span>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <span className="text-white/50">연도</span>
                  <Select
                    value={String(selectedYear)}
                    onValueChange={(value: string) =>
                      setSelectedYear(Number(value))
                    }
                  >
                    <SelectTrigger className="w-24 bg-white/5 border-white/15 text-white/80">
                      <SelectValue placeholder="연도 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 text-white border border-white/10">
                      {yearOptions.map(year => (
                        <SelectItem key={year} value={String(year)}>
                          {year}년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/50">학기</span>
                  <Select
                    value={String(selectedSemester)}
                    onValueChange={(value: string) =>
                      setSelectedSemester(Number(value))
                    }
                  >
                    <SelectTrigger className="w-24 bg-white/5 border-white/15 text-white/80">
                      <SelectValue placeholder="학기 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 text-white border border-white/10">
                      {semesterOptions.map(semester => (
                        <SelectItem key={semester} value={String(semester)}>
                          {semester}학기
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Panel */}
        <div className="flex-1 bg-black/30 backdrop-blur-sm p-6 overflow-hidden flex flex-col relative">
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
          <div className="flex-1 overflow-hidden relative rounded-lg">
            {isGeneratingTimetable && (
              <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-sm text-white/80">AI 시간표 생성 중...</span>
              </div>
            )}
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

      <Dialog open={isSavedDialogOpen} onOpenChange={setIsSavedDialogOpen}>
        <DialogContent className="max-w-2xl bg-black/95 text-white border border-white/15">
          <DialogHeader>
            <DialogTitle className="text-white">저장된 AI 시간표</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                총 {savedAiTimetables.length}건이 저장되어 있습니다.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadSavedTimetables()}
                  disabled={isSavedTimetablesLoading}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  새로고침
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSavedTimetables}
                  disabled={
                    isDeletingSavedTimetables ||
                    savedAiTimetables.length === 0
                  }
                  className="text-red-400 hover:text-white hover:bg-red-500/30 disabled:opacity-40"
                >
                  전체 삭제
                </Button>
              </div>
            </div>

            {isSavedTimetablesLoading ? (
              <div className="py-12 flex flex-col items-center gap-3 text-white/70">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">저장된 시간표를 불러오는 중...</span>
              </div>
            ) : savedAiTimetables.length === 0 ? (
              <div className="py-12 text-center text-white/50">
                저장된 AI 시간표가 없습니다.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {savedAiTimetables.map(entry => (
                  <div
                    key={entry.id}
                    className="border border-white/15 rounded-xl p-4 bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h4 className="text-white">
                          {entry.title?.trim() ||
                            entry.resultSummary?.trim() ||
                            `AI 시간표 #${entry.timetableId}`}
                        </h4>
                        {entry.resultSummary && (
                          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                            {entry.resultSummary}
                          </p>
                        )}
                        {entry.message && (
                          <p className="text-xs text-white/50 leading-relaxed whitespace-pre-line">
                            요청: {entry.message}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-white/45 text-right">
                        <div>저장 ID: {entry.id}</div>
                        <div>시간표 ID: {entry.timetableId}</div>
                        <div>{new Date(entry.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
