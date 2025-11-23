import { useState, useEffect, useRef } from 'react';
import { Save, User, ArrowLeft, Users } from 'lucide-react';
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

  // Load user id for chat
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

  // Load chat history when opening chat
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

  // Handle initial message from welcome screen
  useEffect(() => {
    // 이미 처리된 initialMessage는 다시 처리하지 않음
    if (
      !initialMessage ||
      !myUserId ||
      processedInitialMessageRef.current === initialMessage
    ) {
      return;
    }

    // 이 메시지를 처리 중임을 표시
    processedInitialMessageRef.current = initialMessage;

    let mounted = true;
    // history를 먼저 로드하고, 그 다음에 initialMessage를 처리
    (async () => {
      try {
        // 기존 history 로드
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

        // initialMessage가 이미 history에 있는지 확인 (중복 방지)
        const alreadyExists = mapped.some(
          (m) => m.sender === 'user' && m.text === initialMessage,
        );
        if (alreadyExists) {
          // 이미 history에 있으면 버튼 가시성만 체크
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
            // 실패 시 기존 상태 유지
          }
          // initialMessage 처리 완료 후 초기화 (이미 history에 있으므로 재전송하지 않음)
          if (mounted && onInitialMessageProcessed) {
            onInitialMessageProcessed();
          }
          return;
        }

        // initialMessage 전송
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

        // 버튼 가시성 판단
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
          // 실패 시 기존 상태 유지
        }

        // history 다시 로드하여 서버에 기록된 내용 반영
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
          // history 재로드 실패 시 현재 메시지 유지
        }

        // initialMessage 처리 완료 후 초기화
        if (mounted && onInitialMessageProcessed) {
          onInitialMessageProcessed();
        }
      } catch {
        if (!mounted) return;
        // history 로드 실패 시에도 initialMessage는 전송 시도
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

          // 버튼 가시성 판단
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
            // 실패 시 기존 상태 유지
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
            // initialMessage 처리 완료 후 초기화
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

    // optimistic: add only user message
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

      // 버튼 가시성 판단
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
        // 실패 시 기존 상태 유지
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

  const generateAIResponse = (userInput: string, messageCount: number) => {
    const responses = [
      '좋아요! 어떤 과목을 선호하시나요? (예: 전공필수, 전공선택, 교양)',
      '시간대 선호도가 있으신가요? (예: 오전 수업, 오후 수업, 공강 요일)',
      '네, 이해했습니다! 위의 "시간표 생성" 버튼을 눌러주시면 맞춤 시간표를 만들어드리겠습니다.',
      '알겠습니다. 다른 요청사항이 있으시면 말씀해주세요!',
    ];

    // 시간표가 이미 있고 수정 관련 키워드가 있는 경우
    if (timetable.length > 0) {
      const modifyKeywords = [
        '수정',
        '변경',
        '바꿔',
        '교체',
        '빼고',
        '추가',
        '삭제',
        '조정',
        '다시',
      ];
      const hasModifyKeyword = modifyKeywords.some((keyword) =>
        userInput.includes(keyword),
      );

      if (hasModifyKeyword) {
        return '네, 요청사항을 확인했습니다. 오른쪽의 "대화 기반 수정" 버튼을 눌러주시면 시간표를 업데이트하겠습니다.';
      }
    }

    return responses[Math.min(messageCount, responses.length - 1)];
  };

  const handleGenerateTimetable = async () => {
    console.log('handleGenerateTimetable 호출됨, canGenerate:', canGenerate);
    if (!canGenerate) {
      toast.error('아직 시간표 생성 조건이 충족되지 않았어요.');
      return;
    }
    const uid = myUserId ?? (await getMyProfile()).userId;
    console.log('시간표 생성 시작, userId:', uid);

    // 올해/학기 간단 추론
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month >= 1 && month <= 6 ? 1 : 2;

    setIsTimetableGenerating(true);
    try {
      // ✅ 최근 유저 메시지 기반으로 message 생성 (summary API 제거)
      const userMessages = messages.filter((m) => m.sender === 'user');
      if (userMessages.length === 0) {
        toast.error(
          '시간표를 생성할 대화 내용이 없습니다. 먼저 원하는 조건을 말해 주세요.',
        );
        return;
      }

      const recentUserMessages = userMessages.slice(-10).map((m) => m.text);
      const message = recentUserMessages.join('\n');

      console.log(
        '시간표 생성 API 호출 시작, message:',
        message,
        'year:',
        year,
        'semester:',
        semester,
      );

      const res = await generateAITimetable({
        userId: uid,
        message,
        year,
        semester,
      });

      console.log('AI 시간표 API 응답:', res);
      console.log('API 응답 items:', res.items);

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
      console.log('변환된 시간표 슬롯:', slots);
      setTimetable(slots);
      setCanModify(false);
      setCurrentTimetableId(res.id);
      setCurrentTimetableTitle(
        res.title || '시간표가 생성되었습니다!',
      );

      const { majorCredits, generalCredits, totalCredits } =
        calculateCredits(slots);
      console.log('전공/교양 학점 계산:', {
        majorCredits,
        generalCredits,
        totalCredits,
      });

      toast.success(res.title || '시간표가 생성되었습니다!');
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
    console.log('시간표 수정 시작, userId:', uid);

    // 올해/학기 간단 추론
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month >= 1 && month <= 6 ? 1 : 2;

    setIsTimetableGenerating(true);
    try {
      // ✅ 최근 유저 메시지 기반으로 message 생성 (summary API 제거)
      const userMessages = messages.filter((m) => m.sender === 'user');
      if (userMessages.length === 0) {
        toast.error('시간표를 수정할 대화 내용이 없습니다.');
        return;
      }

      const recentUserMessages = userMessages.slice(-10).map((m) => m.text);
      const message = recentUserMessages.join('\n');

      console.log(
        '시간표 수정 API 호출 시작, message:',
        message,
        'year:',
        year,
        'semester:',
        semester,
      );

      const res = await generateAITimetable({
        userId: uid,
        message,
        year,
        semester,
      });

      console.log('AI 시간표 수정 API 응답:', res);
      console.log('API 응답 items:', res.items);

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
      console.log('변환된 시간표 슬롯 (수정):', slots);
      setTimetable(slots);
      setCanModify(false);
      setCurrentTimetableId(res.id);
      setCurrentTimetableTitle(
        res.title || '시간표가 수정되었습니다!',
      );

      const { majorCredits, generalCredits, totalCredits } =
        calculateCredits(slots);
      console.log('전공/교양 학점 계산 (수정):', {
        majorCredits,
        generalCredits,
        totalCredits,
      });

      toast.success(res.title || '시간표가 수정되었습니다!');
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
      // initialMessage 처리 상태도 초기화
      processedInitialMessageRef.current = null;
      // initialMessage도 초기화하여 재사용 방지
      if (onInitialMessageProcessed) {
        onInitialMessageProcessed();
      }
      toast.success('대화가 초기화되었습니다.');
    } catch (e: any) {
      toast.error(
        '대화 초기화에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
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
      toast.error(
        '시간표 ID를 찾을 수 없습니다. 시간표를 다시 생성해주세요.',
      );
      return;
    }

    const uid = myUserId ?? (await getMyProfile()).userId;

    // 사용자의 마지막 메시지를 resultSummary로 사용
    const lastUserMsg =
      [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
    const resultSummary = lastUserMsg || 'AI가 생성한 맞춤 시간표입니다.';

    try {
      await saveAITimetable({
        userId: uid,
        timetableId: currentTimetableId,
        resultSummary,
      });
      toast.success('시간표가 저장되었습니다!');
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
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15"
          >
            <User className="size-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Panel */}
        <div className="w-2/5">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onShowSeniorTimetables={() => navigate('seniorTimetables')}
            onResetChat={handleResetChat}
          />
        </div>

        {/* Timetable Panel */}
        <TimetablePanel
          timetable={timetable}
          onGenerateTimetable={handleGenerateTimetable}
          onModifyTimetable={handleModifyTimetable}
          isGenerating={isTimetableGenerating}
          hasEnoughMessages={canGenerate}
          canModifyTimetable={canModify}
        />
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

      {/* Ad Banner for Free Users */}
      {(!user || user.plan !== 'premium') && showAd && (
        <div className="relative z-20">
          <AdBanner position="bottom" onClose={() => setShowAd(false)} />
        </div>
      )}
    </div>
  );
}