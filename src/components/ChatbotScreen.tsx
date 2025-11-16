import { useState, useEffect } from 'react';
import { Save, User, ArrowLeft, Users } from 'lucide-react';
import { Button } from './ui/button';
import ChatPanel from './ChatPanel';
import TimetablePanel from './TimetablePanel';
import LoginModal from './LoginModal';
import PurchaseModal from './PurchaseModal';
import AdBanner from './AdBanner';
import { toast } from 'sonner';
import type { User as UserType } from '../App';
import { getMyProfile, sendChatMessage, getChatHistory, deleteChatHistory, getAIGenerateButtonVisibility, generateAITimetable } from '../lib/api';
import Logo from './Logo';

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

interface ChatbotScreenProps {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile' | 'seniorTimetables') => void;
  initialMessage?: string;
}

export default function ChatbotScreen({ user, setUser, navigate, initialMessage }: ChatbotScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTimetableGenerating, setIsTimetableGenerating] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [canGenerate, setCanGenerate] = useState(false);
  const [generateSuggestion, setGenerateSuggestion] = useState<string>('');

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
    return () => { mounted = false; };
  }, []);

  // Load chat history when opening chat (if no initialMessage flow)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!myUserId) return;
      if (initialMessage) return; // 초기 메시지 플로우를 우선
      try {
        const history = await getChatHistory(myUserId);
        if (!mounted) return;
        const mapped: Message[] = history.map(h => ({
          id: String(h.id),
          text: h.content,
          sender: h.role === 'USER' ? 'user' : 'ai',
          timestamp: new Date(h.createdAt),
        }));
        setMessages(mapped);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId]);

  // Handle initial message from welcome screen (without placeholder)
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: initialMessage,
        sender: 'user',
        timestamp: new Date(),
      };

      // push only user message
      setMessages([userMessage]);
      setIsChatLoading(true);

      (async () => {
        try {
          const uid = myUserId ?? (await getMyProfile()).userId;
          const res = await sendChatMessage({ userId: uid, message: initialMessage });
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: res.reply,
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: '응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        } finally {
          setIsChatLoading(false);
        }
      })();
    }
  }, [initialMessage]);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    // optimistic: add only user message
    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const uid = myUserId ?? (await getMyProfile()).userId;
      const res = await sendChatMessage({ userId: uid, message });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: res.reply,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // 버튼 가시성 판단
      const recentUserMessages = [...messages, userMessage]
        .filter(m => m.sender === 'user')
        .slice(-5)
        .map(m => m.text);
      try {
        const vis = await getAIGenerateButtonVisibility({
          userId: uid,
          lastUserMessage: message,
          recentUserMessages,
        });
        setCanGenerate(!!vis.visible);
        setGenerateSuggestion(vis.suggestionText || '');
      } catch {
        // 실패 시 기존 상태 유지
      }
    } catch {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
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
      const modifyKeywords = ['수정', '변경', '바꿔', '교체', '빼고', '추가', '삭제', '조정', '다시'];
      const hasModifyKeyword = modifyKeywords.some(keyword => userInput.includes(keyword));
      
      if (hasModifyKeyword) {
        return '네, 요청사항을 확인했습니다. 오른쪽의 "대화 기반 수정" 버튼을 눌러주시면 시간표를 업데이트하겠습니다.';
      }
    }

    return responses[Math.min(messageCount, responses.length - 1)];
  };

  const handleGenerateTimetable = async () => {
    if (!canGenerate) {
      toast.error('아직 시간표 생성 조건이 충족되지 않았어요.');
      return;
    }
    const uid = myUserId ?? (await getMyProfile()).userId;
    // 사용자 마지막 메시지를 프롬프트로 사용
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || '';
    // 올해/학기 간단 추론
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month >= 1 && month <= 6 ? 1 : 2;

    setIsTimetableGenerating(true);
    try {
      const res = await generateAITimetable({ userId: uid, message: lastUserMsg, year, semester });
      // items -> TimeSlot[] 변환
      const DAY_MAP: Record<string, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' };
      // TimetableGrid는 1시간 단위 행을 사용하므로, 시작 시간은 “정시”로 정규화
      const GENERAL_PERIODS: Record<number, string> = { 1: '09:00', 2: '10:00', 3: '11:00', 4: '12:00', 5: '13:00', 6: '14:00', 7: '15:00', 8: '16:00', 9: '17:00' };
      // 전공 교시(75분)를 1시간 그리드에 연속되게 매핑 (목업 규칙과 동일)
      // 21->09:00, 22->10:00, 23->11:00, 24->13:00, 25->15:00, 26->16:00
      const MAJOR_PERIODS: Record<number, string> = { 21: '09:00', 22: '10:00', 23: '11:00', 24: '13:00', 25: '15:00', 26: '16:00' };
      const isMajor = (cat: string) => ['전필', '전선', '전심', '전공', '전핵'].some(x => (cat || '').includes(x));

      const slots: TimeSlot[] = [];
      for (const it of res.items) {
        const day = DAY_MAP[it.dayOfWeek] || it.dayOfWeek;
        for (let p = it.startPeriod; p <= it.endPeriod; p++) {
          const time = (p >= 21 ? MAJOR_PERIODS[p] : GENERAL_PERIODS[p]) || '09:00';
          slots.push({
            day,
            time,
            subject: it.courseName,
            room: it.room || '',
            credits: 3,
            type: isMajor(it.category) ? 'major' : 'general',
          });
        }
      }
      setTimetable(slots);
      toast.success(res.title || '시간표가 생성되었습니다!');
    } catch (e: any) {
      toast.error(e?.message || '시간표 생성에 실패했습니다.');
    } finally {
      setIsTimetableGenerating(false);
    }
  };

  const handleModifyTimetable = () => {
    if (messages.length < 2) {
      toast.error('대화 내용을 바탕으로 수정 요청을 해주세요.');
      return;
    }

    setIsTimetableGenerating(true);
    toast.success('대화 내용을 분석하여 시간표를 수정합니다...');

    // 시간표 수정 로직 (샘플 데이터 - 일부 변경)
    setTimeout(() => {
      // 기존 시간표에서 일부 과목을 변경하거나 추가/삭제
      const modifiedTimetable: TimeSlot[] = [
        { day: '월', time: '09:00', subject: '쇼비즈니스아트', room: '예-307', credits: 3, type: 'major' },
        { day: '월', time: '10:00', subject: 'World English 2', room: '은2-504', credits: 2, type: 'general' },
        { day: '월', time: '13:00', subject: '경영학원론', room: '복-203', credits: 3, type: 'major' },
        { day: '화', time: '10:00', subject: '쇼비즈니스아트', room: '예-307', credits: 3, type: 'major' },
        { day: '화', time: '12:00', subject: 'JAVA프로그래밍', room: '복-521', credits: 3, type: 'major' },
        { day: '화', time: '15:00', subject: '영화감상과비평', room: '예-201', credits: 2, type: 'general' }, // 변경된 과목
        { day: '수', time: '09:00', subject: '데이터구조', room: '복-508', credits: 3, type: 'major' },
        { day: '수', time: '12:00', subject: '알고리즘', room: '복-508', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: '이산수학', room: '복-102', credits: 3, type: 'major' },
        { day: '목', time: '10:00', subject: '논리와비판적사고', room: '은2-305', credits: 2, type: 'general' },
        { day: '목', time: '12:00', subject: '이산수학', room: '복-102', credits: 3, type: 'major' },
        { day: '목', time: '13:00', subject: '알고리즘', room: '복-508', credits: 3, type: 'major' },
        { day: '목', time: '15:00', subject: '딥러닝', room: '복-106', credits: 3, type: 'major' },
        { day: '금', time: '09:00', subject: '운영체제', room: '복-401', credits: 3, type: 'major' }, // 추가된 과목
        { day: '금', time: '11:00', subject: '컴퓨터네트워크', room: '복-405', credits: 3, type: 'major' },
        { day: '금', time: '16:00', subject: '딥러닝', room: '복-106', credits: 3, type: 'major' },
      ];
      setTimetable(modifiedTimetable);
      setIsTimetableGenerating(false);
      toast.success('시간표가 수정되었습니다!');
    }, 2000);
  };

  const handleResetChat = async () => {
    try {
      const uid = myUserId ?? (await getMyProfile()).userId;
      await deleteChatHistory(uid);
      setMessages([]);
      setTimetable([]);
      toast.success('대화가 초기화되었습니다.');
    } catch (e: any) {
      toast.error('대화 초기화에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleSaveTimetable = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    toast.success('시간표가 저장되었습니다!');
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