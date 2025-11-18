import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ArrowLeft, Edit2, Plus, Maximize2, Trash2 } from 'lucide-react';
import TimetableGrid from './TimetableGrid';
import PurchaseModal from './PurchaseModal';
import AddPreviousTimetableDialog from './AddPreviousTimetableDialog';
import { toast } from 'sonner';
import type { User } from '../App';
import Logo from './Logo';
import { Calendar, Sparkles } from 'lucide-react';
import { convertApiItemsToTimeSlots, generateTimetableTitle, calculateCredits } from '../lib/timetableUtils';
import { 
  getMyProfile,
  getRepresentativeTimetable,
  getSavedTimetables,
  deleteAIGeneratedTimetable,
  createTimetable,
  deleteTimetable as deleteTimetableApi,
  getMyTimetables,
  getAITimetable,
  deleteAITimetable
} from '../lib/api';

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

interface TimetableData {
  id?: number;
  year: string;
  semester: string;
  title: string;
  slots: TimeSlot[];
}

const PLAN_KEYS = ['A', 'B', 'C'] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

interface AITimetablePlan {
  planKey: PlanKey;
  id: string;
  createdAt: string;
  title: string;
  resultSummary?: string;
  slots: TimeSlot[];
}

interface ProfileScreenProps {
  user: User;
  setUser: (user: User | null) => void;
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile' | 'profileEdit' | 'timetableEdit') => void;
  onEditTimetable: (timetable: { id: number; title: string; slots: TimeSlot[] }) => void;
}

const initialPreviousTimetables: TimetableData[] = [];

export default function ProfileScreen({ user, setUser, navigate, onEditTimetable }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState('previous');
  const [selectedTimetable, setSelectedTimetable] = useState<{ slots: TimeSlot[], title: string } | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAddTimetableDialog, setShowAddTimetableDialog] = useState(false);
  // 이전 학기 시간표: /api/timetables/me 에서 관리하는 일반 시간표들만 저장
  const [previousTimetables, setPreviousTimetables] = useState<TimetableData[]>(initialPreviousTimetables);
  const [aiTimetables, setAiTimetables] = useState<Record<PlanKey, AITimetablePlan | null>>({
    A: null,
    B: null,
    C: null,
  });
  const [activePlan, setActivePlan] = useState<PlanKey>('A');
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // Fetch my profile from API on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyProfile();
        if (!mounted) return;
        setMyUserId(me.userId);
        const mappedYear = me.grade ? `${me.grade}학년` : '';
        setUser({
          ...user,
          name: me.name ?? user.name,
          studentId: me.studentId ?? user.studentId,
          department: me.department ?? user.department,
          year: mappedYear || user.year,
          graduationYear: me.graduationYear ? String(me.graduationYear) : user.graduationYear,
        });
      } catch (_e) {
        // 프로필 로딩 실패 시에는 조용히 유지
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 이전 학기 시간표 목록 불러오기: /api/timetables/me 에서만 가져옴 (일반 시간표만)
  // AI 시간표는 제외하고, 이전 학기 시간표들만 관리
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!myUserId) return;
      try {
        // /api/timetables/me API 호출 - 일반 시간표 목록만 반환
        const timetables = await getMyTimetables(myUserId);
        if (!mounted) return;
        const mapped = timetables.map((t) => {
          const year2 = String(t.year).slice(2);
          const semesterCode = t.semester === 1 ? '1' : t.semester === 2 ? '2' : t.semester === 3 ? 'summer' : 'winter';
          const slots = convertApiItemsToTimeSlots(t.items as any);
          const fallbackTitle = generateTimetableTitle(t.year, t.semester);
          return { id: t.id, year: year2, semester: semesterCode, title: t.title || fallbackTitle, slots };
        });
        setPreviousTimetables(mapped);
      } catch {
        // 조용히 실패 처리
      }
    })();
    return () => { mounted = false; };
  }, [myUserId]);

  // AI 생성 시간표 (최대 3개 플랜)
  useEffect(() => {
    let mounted = true;
    const toPlanKey = (value?: string | null): PlanKey | undefined => {
      if (!value) return undefined;
      const upper = value.toUpperCase();
      return PLAN_KEYS.find((key) => key === upper);
    };

    (async () => {
      if (!myUserId) return;
      try {
        const response = await getAITimetable(myUserId);
        if (!mounted) return;
        const nextPlans: Record<PlanKey, AITimetablePlan | null> = { A: null, B: null, C: null };
        const payloads = Array.isArray(response) ? response : response ? [response] : [];

        payloads.slice(0, PLAN_KEYS.length).forEach((plan, index) => {
          if (!plan) return;
          const planKey = toPlanKey((plan as any).planKey) ?? PLAN_KEYS[index];
          const slots = convertApiItemsToTimeSlots(plan.items as any);
          const createdAt = plan.createdAt ? new Date(plan.createdAt).toLocaleString('ko-KR') : '';
          nextPlans[planKey] = {
            planKey,
            id: String(plan.id ?? plan.timetableId ?? `${planKey}-${index}`),
            createdAt,
            title: plan.title || `플랜 ${planKey} 시간표`,
            resultSummary: plan.resultSummary,
            slots,
          };
        });

        setAiTimetables(nextPlans);
        const firstFilled = PLAN_KEYS.find((key) => nextPlans[key]);
        setActivePlan(firstFilled ?? 'A');
      } catch {
        if (mounted) {
          setAiTimetables({ A: null, B: null, C: null });
        }
      }
    })();
    return () => { mounted = false; };
  }, [myUserId]);
  const handleUpgradeToPremium = () => {
    setUser({
      ...user,
      plan: 'premium',
    });
  };

  const handleAddTimetable = async (year: string, semester: string) => {
    if (!myUserId) {
      toast.error('사용자 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }
    const fullYear = 2000 + parseInt(year, 10);
    const semesterMap: Record<string, number> = { '1': 1, '2': 2, summer: 3, winter: 4 };
    const semesterNumber = semesterMap[semester];
    if (!semesterNumber) {
      toast.error('올바르지 않은 학기입니다.');
      return;
    }
    const semesterLabel = semester === 'summer' ? '여름학기' : semester === 'winter' ? '겨울학기' : `${semester}학기`;
    const title = `20${year}학년도 ${semesterLabel}`;
    try {
      const created = await createTimetable(myUserId, { year: fullYear, semester: semesterNumber, title });
      const newTimetable: TimetableData = { id: created.id, year, semester, title: created.title || title, slots: [] };
      setPreviousTimetables([...previousTimetables, newTimetable]);
      toast.success(`${title} 시간표가 추가되었습니다.`);
    } catch (e: any) {
      toast.error(e?.message || '시간표 생성에 실패했어요.');
    }
  };

  const handleDeleteTimetable = async (index: number) => {
    const target = previousTimetables[index];
    if (!target) return;
    if (target.id) {
      try {
        await deleteTimetableApi(target.id);
      } catch (e: any) {
        toast.error(e?.message || '시간표 삭제에 실패했어요.');
        return;
      }
    }
    const newTimetables = previousTimetables.filter((_, i) => i !== index);
    setPreviousTimetables(newTimetables);
    toast.success('시간표가 삭제되었습니다.');
  };

  const handleDeleteAITimetable = async (planKey: PlanKey) => {
    if (!myUserId) {
      toast.error('사용자 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }
    const targetPlan = aiTimetables[planKey];
    if (!targetPlan) {
      toast.error(`플랜 ${planKey} 시간표가 비어 있습니다.`);
      return;
    }

    try {
      await deleteAITimetable(myUserId, planKey);
      setAiTimetables((prev) => {
        const updated = { ...prev, [planKey]: null };
        if (activePlan === planKey) {
          const nextActive = PLAN_KEYS.find((key) => updated[key]);
          setActivePlan(nextActive ?? 'A');
        }
        return updated;
      });
      toast.success(`플랜 ${planKey} 시간표가 삭제되었습니다.`);
    } catch (e: any) {
      toast.error(e?.message || 'AI 시간표 삭제에 실패했습니다.');
    }
  };

  const handleAddAITimetable = (planKey: PlanKey) => {
    if (aiTimetables[planKey] && typeof window !== 'undefined') {
      const confirmed = window.confirm(`플랜 ${planKey} 시간표를 새로 생성하시겠습니까?\n기존 내용은 덮어씁니다.`);
      if (!confirmed) return;
    }
    sessionStorage?.setItem('aiPlanTarget', planKey);
    navigate('chatbot');
  };

  const renderTimetableCard = (
    slots: TimeSlot[],
    index: number,
    title: string,
    showDelete: boolean = false,
    subtitle?: string,
  ) => {
    const { majorCredits, generalCredits, totalCredits } = calculateCredits(slots);
    const showAIBadge = title.includes('시간표');

    return (
      <Card key={index} className="p-4 hover:shadow-[0_0_30px_rgba(140,69,255,0.3)] transition-all bg-black/60 backdrop-blur-md border-white/15">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white">{title}</h4>
            </div>
            {subtitle && <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>}
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="text-purple-400">전공 {majorCredits}학점</span>
              <span className="text-blue-400">교양 {generalCredits}학점</span>
              <span className="text-white/60">총 {totalCredits}학점</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {showAIBadge && (
              <span className="px-2.5 py-0.5 text-[12px] font-semibold rounded-full bg-purple-600/20 text-purple-300 shadow-[0_0_20px_rgba(140,69,255,0.5)]">
                AI
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setSelectedTimetable({ slots, title })}
            >
              <Maximize2 className="size-3" />
              확대
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => {
                const tt = previousTimetables[index];
                if (!tt?.id) return;
                onEditTimetable({ id: tt.id, title, slots });
              }}
            >
              <Edit2 className="size-3" />
              수정
            </Button>
            {showDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => handleDeleteTimetable(index)}
              >
                <Trash2 className="size-3" />
                삭제
              </Button>
            )}
          </div>
        </div>
        <div className="h-[450px] rounded-lg overflow-hidden bg-black/40">
          <TimetableGrid timetable={slots} />
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-[#020103] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 size-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 size-96 bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('welcome')}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="size-4" />
              메인으로
            </Button>
            <Logo variant="icon" size="sm" />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setUser(null);
              navigate('login');
            }}
            className="bg-white/5 border-white/15 text-white hover:bg-white/10"
          >
            로그아웃
          </Button>
        </div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 mb-6 bg-gradient-to-br from-purple-600/40 to-blue-600/40 backdrop-blur-xl border-white/20 shadow-[0_0_40px_rgba(140,69,255,0.4)]">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="size-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl">👨‍🎓</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-white">{user.name}</h2>
                    {user.plan === 'premium' ? (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white">
                        프리미엄
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/70">
                        무료
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-white/90">
                    <p>학번: {user.studentId}</p>
                    <p>학과: {user.department}</p>
                    <p>학년: {user.year}</p>
                    {user.graduationYear && <p>졸업년도: {user.graduationYear}</p>}
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => navigate('profileEdit')}
              >
                <Edit2 className="size-3" />
                프로필 수정
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Timetables Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 mb-6 bg-black/60 backdrop-blur-md border border-white/15">
              <TabsTrigger 
                value="previous" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-white/60"
              >
                이전 학기 시간표
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-white/60"
              >
                AI 생성 시간표
              </TabsTrigger>
            </TabsList>

            <TabsContent value="previous" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={() => setShowAddTimetableDialog(true)}
                  className="gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]"
                >
                  <Plus className="size-4" />
                  시간표 추가
                </Button>
              </div>
              {previousTimetables.length === 0 ? (
                <Card className="p-12 text-center bg-black/40 backdrop-blur-md border-white/10 border-dashed">
                  <div className="mx-auto size-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="size-8 text-purple-400" />
                  </div>
                  <h3 className="text-white mb-2">등록된 시간표가 없습니다</h3>
                  <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                    이전 학기 시간표를 추가하면 AI가 더 정확한 추천을 제공합니다
                  </p>
                  <Button
                    onClick={() => setShowAddTimetableDialog(true)}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                  >
                    <Plus className="size-4" />
                    첫 시간표 추가하기
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {previousTimetables.map((timetable, index) => {
                    const semesterLabel = timetable.semester === 'summer' ? '여름학기' : 
                                        timetable.semester === 'winter' ? '겨울학기' : 
                                        `${timetable.semester}학기`;
                    const subtitle = `${timetable.year}학년도 ${semesterLabel}`;
                    return renderTimetableCard(
                      timetable.slots, 
                      index, 
                      timetable.title,
                      true,
                      subtitle,
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              {/* Plan Info */}
              {user.plan === 'free' && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm mb-1">
                        무료 플랜 (한 달 무료 체험)
                      </p>
                      <p className="text-white/60 text-xs">
                        광고 시청으로 기본 기능 이용 가능 · 유료 기능 횟수 제한
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        프리미엄: 광고 없음 + 무제한 생성 + 고급 기능
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowPurchaseModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]\n                      "
                    >
                      업그레이드
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {PLAN_KEYS.map((planKey) => {
                      const plan = aiTimetables[planKey];
                      const isActive = activePlan === planKey;
                      return (
                        <button
                          key={planKey}
                          onClick={() => setActivePlan(planKey)}
                          className={`px-4 py-2 rounded-lg border text-left transition ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-white/40 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)]'
                              : 'bg-black/50 border-white/20 text-white/70 hover:text-white'
                          }`}
                        >
                          <div className="text-xs uppercase tracking-wide">플랜 {planKey}</div>
                          <div className="text-sm font-medium">
                            {plan ? plan.title : '미생성'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-white/60 text-xs">
                    최대 3개의 AI 시간표를 관리하고 상황에 맞게 전환하세요.
                  </p>
                </div>

                {(() => {
                  const plan = aiTimetables[activePlan];
                  if (plan) {
                    const { majorCredits, generalCredits, totalCredits } = calculateCredits(plan.slots);
                    const showAIBadge = plan.title.includes('시간표');
                    return (
                      <Card className="p-4 hover:shadow-[0_0_30px_rgba(140,69,255,0.3)] transition-all bg-black/60 backdrop-blur-md border-white/15">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[11px] bg-gradient-to-r from-purple-600/60 to-blue-600/60 border border-white/20 text-white">
                                플랜 {activePlan}
                              </span>
                              <h4 className="text-white">{plan.title}</h4>
                            </div>
                            {plan.createdAt && (
                              <p className="text-xs text-white/50 mt-1">생성일: {plan.createdAt}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs mt-1">
                              <span className="text-purple-400">전공 {majorCredits}학점</span>
                              <span className="text-blue-400">교양 {generalCredits}학점</span>
                              <span className="text-white/60">총 {totalCredits}학점</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end items-center">
                            {showAIBadge && (
                              <span className="px-2.5 py-0.5 text-[12px] font-semibold rounded-full bg-purple-600/20 text-purple-300 shadow-[0_0_20px_rgba(140,69,255,0.5)]">
                                AI
                              </span>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
                              onClick={() => setSelectedTimetable({ slots: plan.slots, title: plan.title })}
                            >
                              <Maximize2 className="size-3" />
                              확대
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
                              onClick={() => onEditTimetable({ id: Number(plan.id) || 0, title: plan.title, slots: plan.slots })}
                            >
                              <Edit2 className="size-3" />
                              수정
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
                              onClick={() => handleAddAITimetable(activePlan)}
                            >
                              <Sparkles className="size-3 text-purple-300" />
                              다시 생성
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDeleteAITimetable(activePlan)}
                            >
                              <Trash2 className="size-3" />
                              삭제
                            </Button>
                          </div>
                        </div>
                        {plan.resultSummary && (
                          <div className="p-3 mb-3 bg-white/5 rounded-lg border border-white/10 text-xs text-white/80">
                            {plan.resultSummary}
                          </div>
                        )}
                        <div className="h-[450px] rounded-lg overflow-hidden bg-black/40">
                          <TimetableGrid timetable={plan.slots} />
                        </div>
                      </Card>
                    );
                  }

                  return (
                    <Card className="p-12 text-center bg-black/40 backdrop-blur-md border-white/10 border-dashed">
                      <div className="mx-auto size-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="size-8 text-purple-400" />
                      </div>
                      <h3 className="text-white mb-2">플랜 {activePlan} 시간표를 만들어보세요</h3>
                      <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                        각 상황에 맞는 시간표를 미리 준비해두면 빠르게 비교하고 선택할 수 있어요.
                      </p>
                      <Button
                        onClick={() => handleAddAITimetable(activePlan)}
                        className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]"
                      >
                        <Sparkles className="size-4" />
                        플랜 {activePlan} 시간표 생성
                      </Button>
                    </Card>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Timetable Detail Modal */}
      <Dialog open={!!selectedTimetable} onOpenChange={() => setSelectedTimetable(null)}>
        <DialogContent className="max-w-4xl h-[90vh] bg-black/95 backdrop-blur-xl border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedTimetable?.title}</DialogTitle>
            <DialogDescription className="sr-only">
              시간표 상세 보기
            </DialogDescription>
            {selectedTimetable && (() => {
              const { majorCredits, generalCredits, totalCredits } = calculateCredits(selectedTimetable.slots);
              return (
                <div className="flex items-center gap-4 text-sm mt-2">
                  <span className="text-purple-400">전공 {majorCredits}학점</span>
                  <span className="text-blue-400">교양 {generalCredits}학점</span>
                  <span className="text-white">총 {totalCredits}학점</span>
                </div>
              );
            })()}
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedTimetable && <TimetableGrid timetable={selectedTimetable.slots} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <PurchaseModal
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handleUpgradeToPremium}
        />
      )}

      {/* Add Timetable Dialog */}
      <AddPreviousTimetableDialog
        open={showAddTimetableDialog}
        onClose={() => setShowAddTimetableDialog(false)}
        onAdd={handleAddTimetable}
      />
    </div>
  );
}