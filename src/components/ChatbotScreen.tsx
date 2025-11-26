import { useState, useEffect, useRef } from 'react';
import { Save, User, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import ChatPanel from './ChatPanel';
import TimetablePanel from './TimetablePanel';
import LoginModal from './LoginModal';
import PurchaseModal from './PurchaseModal';
import AdBanner from './AdBanner';
import { toast } from 'sonner';
import type { User as UserType } from '../App';
import {
  getMyProfile,
  sendChatMessage,
  getChatHistory,
  deleteChatHistory,
  getAIGenerateButtonVisibility,
  generateAITimetable,
  saveAITimetable,
} from '../lib/api';
import {
  convertApiItemsToTimeSlots,
  calculateCredits,
  type ApiCourseItem,
  type TimeSlot,
} from '../lib/timetableUtils';
import Logo from './Logo';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  animate?: boolean;
}

type PlanKey = 'A' | 'B' | 'C';

interface ChatbotScreenProps {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  navigate: (
    screen:
      | 'welcome'
      | 'chatbot'
      | 'login'
      | 'signup'
      | 'profile'
      | 'seniorTimetables',
  ) => void;
  initialMessage?: string;
  onInitialMessageProcessed?: () => void;
}

export default function ChatbotScreen({
  user,
  setUser,
  navigate,
  initialMessage,
  onInitialMessageProcessed,
}: ChatbotScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTimetableGenerating, setIsTimetableGenerating] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [canGenerate, setCanGenerate] = useState(false);
  const [canModify, setCanModify] = useState(false);
  const [generateSuggestion, setGenerateSuggestion] = useState<string>('');
  const [currentTimetableId, setCurrentTimetableId] = useState<number | null>(
    null,
  );
  const [currentTimetableTitle, setCurrentTimetableTitle] =
    useState<string>('');
  const processedInitialMessageRef = useRef<string | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  // ✅ 현재 작업 중인 AI 플랜 (A/B/C)
  const [planKey, setPlanKey] = useState<PlanKey>('A');

  // 세션에서 플랜 키 읽어오기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('aiPlanTarget');
    if (stored === 'A' || stored === 'B' || stored === 'C') {
      setPlanKey(stored);
    } else {
      setPlanKey('A');
    }
  }, []);

  // 내 프로필 userId
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyProfile();
        if (!mounted) return;
        setMyUserId(me.userId);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 채팅 히스토리 로딩
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!myUserId) return;
      try {
        const history = await getChatHistory(myUserId);
        if (!mounted) return;
        const mapped: Message[] = history.map((h) => ({
          id: String(h.id),
          text: h.content,
          sender: h.role === 'USER' ? 'user' : 'ai',
          timestamp: new Date(h.createdAt),
          animate: false,
        }));
        setMessages(mapped);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId]);

  // welcome 화면에서 넘겨준 initialMessage 처리
  useEffect(() => {
    if (
      !initialMessage ||
      !myUserId ||
      processedInitialMessageRef.current === initialMessage
    ) {
      return;
    }

    processedInitialMessageRef.current = initialMessage;
    let mounted = true;

    (async () => {
      try {
        const history = await getChatHistory(myUserId);
        if (!mounted) return;
        const mapped: Message[] = history.map((h) => ({
          id: String(h.id),
          text: h.content,
          sender: h.role === 'USER' ? 'user' : 'ai',
          timestamp: new Date(h.createdAt),
          animate: false,
        }));
        setMessages(mapped);

        const alreadyExists = mapped.some(
          (m) => m.sender === 'user' && m.text === initialMessage,
        );
        if (alreadyExists) {
          const recentUserMessages = mapped
            .filter((m) => m.sender === 'user')
            .slice(-5)
            .map((m) => m.text);
          try {
            const vis = await getAIGenerateButtonVisibility({
              userId: myUserId,
              lastUserMessage: initialMessage,
              recentUserMessages,
            });
            if (mounted) {
              setCanGenerate(!!vis.visible);
              setGenerateSuggestion(vis.suggestionText || '');
              setCanModify(false);
            }
          } catch {
            //
          }
          if (mounted && onInitialMessageProcessed) {
            onInitialMessageProcessed();
          }
          return;
        }

        const userMessage: Message = {
          id: Date.now().toString(),
          text: initialMessage,
          sender: 'user',
          timestamp: new Date(),
          animate: false,
        };
        if (mounted) {
          setMessages((prev) => [...prev, userMessage]);
          setIsChatLoading(true);
        }

        const uid = myUserId ?? (await getMyProfile()).userId;
        const res = await sendChatMessage({ userId: uid, message: initialMessage });
        if (!mounted) return;

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: res.reply,
          sender: 'ai',
          timestamp: new Date(),
          animate: true,
        };
        setMessages((prev) => [...prev, aiMessage]);

        const recentUserMessages = [...mapped, userMessage]
          .filter((m) => m.sender === 'user')
          .slice(-5)
          .map((m) => m.text);
        try {
          const vis = await getAIGenerateButtonVisibility({
            userId: uid,
            lastUserMessage: initialMessage,
            recentUserMessages,
          });
          if (mounted) {
            setCanGenerate(!!vis.visible);
            setGenerateSuggestion(vis.suggestionText || '');
            setCanModify(false);
          }
        } catch {
          //
        }

        try {
          const updatedHistory = await getChatHistory(uid);
          if (!mounted) return;
          const updatedMapped: Message[] = updatedHistory.map((h) => ({
            id: String(h.id),
            text: h.content,
            sender: h.role === 'USER' ? 'user' : 'ai',
            timestamp: new Date(h.createdAt),
            animate: false,
          }));
          setMessages(updatedMapped);
        } catch {
          //
        }

        if (mounted && onInitialMessageProcessed) {
          onInitialMessageProcessed();
        }
      } catch {
        if (!mounted) return;

        const userMessage: Message = {
          id: Date.now().toString(),
          text: initialMessage,
          sender: 'user',
          timestamp: new Date(),
          animate: false,
        };
        setMessages([userMessage]);
        setIsChatLoading(true);

        try {
          const uid = myUserId ?? (await getMyProfile()).userId;
          const res = await sendChatMessage({
            userId: uid,
            message: initialMessage,
          });
          if (!mounted) return;

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: res.reply,
            sender: 'ai',
            timestamp: new Date(),
            animate: true,
          };
          setMessages((prev) => [...prev, aiMessage]);

          try {
            const vis = await getAIGenerateButtonVisibility({
              userId: uid,
              lastUserMessage: initialMessage,
              recentUserMessages: [initialMessage],
            });
            if (mounted) {
              setCanGenerate(!!vis.visible);
              setGenerateSuggestion(vis.suggestionText || '');
              setCanModify(false);
            }
          } catch {
            //
          }
        } catch {
          if (!mounted) return;
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: '응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
            sender: 'ai',
            timestamp: new Date(),
            animate: false,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } finally {
          if (mounted) {
            setIsChatLoading(false);
            if (onInitialMessageProcessed) {
              onInitialMessageProcessed();
            }
          }
        }
      } finally {
        if (mounted) {
          setIsChatLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [initialMessage, myUserId, onInitialMessageProcessed]);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      animate: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const uid = myUserId ?? (await getMyProfile()).userId;
      const res = await sendChatMessage({ userId: uid, message });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: res.reply,
        sender: 'ai',
        timestamp: new Date(),
        animate: true,
      };
      setMessages((prev) => [...prev, aiMessage]);

      const recentUserMessages = [...messages, userMessage]
        .filter((m) => m.sender === 'user')
        .slice(-5)
        .map((m) => m.text);
      try {
        const vis = await getAIGenerateButtonVisibility({
          userId: uid,
          lastUserMessage: message,
          recentUserMessages,
        });
        setCanGenerate(!!vis.visible);
        setGenerateSuggestion(vis.suggestionText || '');
        setCanModify(timetable.length > 0 ? !!vis.visible : false);
      } catch {
        //
      }
    } catch {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        sender: 'ai',
        timestamp: new Date(),
        animate: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateTimetable = async () => {
    if (!canGenerate) {
      toast.error('아직 시간표 생성 조건이 충족되지 않았어요.');
      return;
    }
    const uid = myUserId ?? (await getMyProfile()).userId;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month >= 1 && month <= 6 ? 1 : 2;

    setIsTimetableGenerating(true);
    try {
      const userMessages = messages.filter((m) => m.sender === 'user');
      if (userMessages.length === 0) {
        toast.error('시간표를 생성할 대화 내용이 없습니다. 먼저 원하는 조건을 말해 주세요.');
        return;
      }

      const recentUserMessages = userMessages.slice(-10).map((m) => m.text);
      const message = recentUserMessages.join('\n');

      const res = await generateAITimetable({
        userId: uid,
        message,
        year,
        semester,
        planKey, // 🔥 플랜 정보 전달
      });

      // Ensure only MON-FRI are accepted, filter out other days
      const filteredItems = res.items.filter(
        (item: any) =>
          ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(item.dayOfWeek)
      );

      const apiItems: ApiCourseItem[] = filteredItems.map(
        (item: any, index: number) => ({
          id: item.id ?? index + 1,
          courseId: item.courseId ?? index + 1,
          credit: item.credit ?? 3,
          professor: item.professor ?? '',
          courseName: item.courseName,
          dayOfWeek: item.dayOfWeek as
            | 'MON'
            | 'TUE'
            | 'WED'
            | 'THU'
            | 'FRI'
            | 'SAT'
            | 'SUN',
          startPeriod: item.startPeriod,
          endPeriod: item.endPeriod,
          room: item.room || '',
          category: item.category || '기타',
          recommendedGrade: item.recommendedGrade ?? null,
        }),
      );

      const slots = convertApiItemsToTimeSlots(apiItems);
      setTimetable(slots);
      setCanModify(false);
      setCurrentTimetableId(res.id);
      setCurrentTimetableTitle(
        res.title || `플랜 ${planKey} 시간표가 생성되었습니다!`,
      );

      const { majorCredits, generalCredits, totalCredits } =
        calculateCredits(slots);
      console.log('credits:', { majorCredits, generalCredits, totalCredits });

      toast.success(res.title || `플랜 ${planKey} 시간표가 생성되었습니다!`);
    } catch (e: any) {
      toast.error(e?.message || '시간표 생성에 실패했습니다.');
    } finally {
      setIsTimetableGenerating(false);
    }
  };

  const handleModifyTimetable = async () => {
    if (!canModify) {
      toast.error('아직 시간표 수정 조건이 충족되지 않았어요.');
      return;
    }
    if (messages.length < 2) {
      toast.error('대화 내용을 바탕으로 수정 요청을 해주세요.');
      return;
    }
    if (timetable.length === 0) {
      toast.error('수정할 시간표가 없습니다. 먼저 시간표를 생성해주세요.');
      return;
    }

    const uid = myUserId ?? (await getMyProfile()).userId;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month >= 1 && month <= 6 ? 1 : 2;

    setIsTimetableGenerating(true);
    try {
      const userMessages = messages.filter((m) => m.sender === 'user');
      if (userMessages.length === 0) {
        toast.error('시간표를 수정할 대화 내용이 없습니다.');
        return;
      }

      const recentUserMessages = userMessages.slice(-10).map((m) => m.text);
      const message = recentUserMessages.join('\n');

      const res = await generateAITimetable({
        userId: uid,
        message,
        year,
        semester,
        planKey, // 🔥 플랜 정보 전달
      });

      const apiItems: ApiCourseItem[] = res.items.map(
        (item: any, index: number) => ({
          id: item.id ?? index + 1,
          courseId: item.courseId ?? index + 1,
          credit: item.credit ?? 3,
          professor: item.professor ?? '',
          courseName: item.courseName,
          dayOfWeek: item.dayOfWeek as
            | 'MON'
            | 'TUE'
            | 'WED'
            | 'THU'
            | 'FRI'
            | 'SAT'
            | 'SUN',
          startPeriod: item.startPeriod,
          endPeriod: item.endPeriod,
          room: item.room || '',
          category: item.category || '기타',
          recommendedGrade: item.recommendedGrade ?? null,
        }),
      );

      const slots = convertApiItemsToTimeSlots(apiItems);
      setTimetable(slots);
      setCanModify(false);
      setCurrentTimetableId(res.id);
      setCurrentTimetableTitle(
        res.title || `플랜 ${planKey} 시간표가 수정되었습니다!`,
      );

      const { majorCredits, generalCredits, totalCredits } =
        calculateCredits(slots);
      console.log('credits(modify):', {
        majorCredits,
        generalCredits,
        totalCredits,
      });

      toast.success(res.title || `플랜 ${planKey} 시간표가 수정되었습니다!`);
    } catch (e: any) {
      toast.error(e?.message || '시간표 수정에 실패했습니다.');
    } finally {
      setIsTimetableGenerating(false);
    }
  };

  const handleResetChat = async () => {
    try {
      const uid = myUserId ?? (await getMyProfile()).userId;
      await deleteChatHistory(uid);
      setMessages([]);
      setTimetable([]);
      setCurrentTimetableId(null);
      setCurrentTimetableTitle('');
      setCanGenerate(false);
      setGenerateSuggestion('');
      setCanModify(false);
      processedInitialMessageRef.current = null;
      if (onInitialMessageProcessed) {
        onInitialMessageProcessed();
      }
      toast.success('대화가 초기화되었습니다.');
    } catch {
      toast.error('대화 초기화에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleSaveTimetable = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (timetable.length === 0) {
      toast.error('저장할 시간표가 없습니다. 먼저 시간표를 생성해주세요.');
      return;
    }

    if (!currentTimetableId) {
      toast.error('시간표 ID를 찾을 수 없습니다. 시간표를 다시 생성해주세요.');
      return;
    }

    const uid = myUserId ?? (await getMyProfile()).userId;

    const lastUserMsg =
      [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
    const resultSummary = lastUserMsg || 'AI가 생성한 맞춤 시간표입니다.';

    try {
      await saveAITimetable({
        userId: uid,
        timetableId: currentTimetableId,
        resultSummary,
        planKey, // 🔥 어떤 플랜에 저장할지 전달
      });
      toast.success(`플랜 ${planKey} 시간표가 저장되었습니다!`);
    } catch (e: any) {
      toast.error(e?.message || '시간표 저장에 실패했습니다.');
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

  return (
    <div className="h-screen flex flex-col relative bg-[#020103]">
      {/* 배경 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      {/* 헤더 */}
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
          <Logo variant="icon" size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveTimetable}
            disabled={timetable.length === 0 || !currentTimetableId}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              timetable.length === 0
                ? '저장할 시간표가 없습니다'
                : '시간표 저장'
            }
          >
            <Save className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleProfileClick}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 p-0 overflow-hidden"
          >
            {!profileImageError ? (
              <img 
                src="/default-profile.png" 
                alt="프로필" 
                className="w-full h-full object-cover"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <User className="size-5" />
            )}
          </Button>
        </div>
      </header>

      {/* 메인 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 왼쪽: 채팅 */}
        <div className="w-2/5">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onShowSeniorTimetables={() => navigate('seniorTimetables')}
            onResetChat={handleResetChat}
          />
        </div>

        {/* 오른쪽: 시간표 */}
        <TimetablePanel
          timetable={timetable}
          onGenerateTimetable={handleGenerateTimetable}
          onModifyTimetable={handleModifyTimetable}
          isGenerating={isTimetableGenerating}
          hasEnoughMessages={canGenerate}
          canModifyTimetable={canModify}
        />
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(user) => {
            setUser(user);
            setShowLoginModal(false);
          }}
        />
      )}

      {/* 결제 모달 */}
      {showPurchaseModal && (
        <PurchaseModal
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handleUpgradeToPremium}
        />
      )}

      {/* 광고 */}
      {(!user || user.plan !== 'premium') && showAd && (
        <div className="relative z-20">
          <AdBanner position="bottom" onClose={() => setShowAd(false)} />
        </div>
      )}
    </div>
  );
}