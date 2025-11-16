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
import { getMyProfile } from '../lib/api';
import { getRepresentativeTimetable, getSavedTimetables, deleteAIGeneratedTimetable } from '../lib/api';

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
  year: string;
  semester: string;
  slots: TimeSlot[];
}

interface ProfileScreenProps {
  user: User;
  setUser: (user: User | null) => void;
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile' | 'profileEdit' | 'timetableEdit') => void;
  onEditTimetable: (timetable: { title: string; slots: TimeSlot[] }) => void;
}

const initialPreviousTimetables: TimetableData[] = [
  {
    year: '24',
    semester: '1',
    slots: [
      { day: '월', time: '09:00', period: '21,22', subject: '프로그래밍 기초', courseCode: 'CS101', room: 'IT-101', credits: 3, type: 'major' },
      { day: '월', time: '13:00', period: '5', subject: '글쓰기와 의사소통', courseCode: 'KOR101', room: '본-205', credits: 2, type: 'general' },
      { day: '화', time: '10:30', period: '22', subject: '이산수학', courseCode: 'MATH201', room: 'IT-202', credits: 3, type: 'major' },
      { day: '화', time: '14:00', period: '6', subject: '영어회화', courseCode: 'ENG101', room: '어-304', credits: 2, type: 'general' },
      { day: '수', time: '09:00', period: '21,22', subject: '프로그래밍 기초', courseCode: 'CS101', room: 'IT-101', credits: 3, type: 'major' },
      { day: '수', time: '12:00', period: '23', subject: '데이터구조', courseCode: 'CS201', room: 'IT-301', credits: 3, type: 'major' },
      { day: '목', time: '10:30', period: '22', subject: '이산수학', courseCode: 'MATH201', room: 'IT-202', credits: 3, type: 'major' },
      { day: '목', time: '13:30', period: '24', subject: '컴퓨터구조', courseCode: 'CS103', room: 'IT-103', credits: 3, type: 'major' },
      { day: '금', time: '11:00', period: '3', subject: '선형대수', courseCode: 'MATH102', room: '복-208', credits: 3, type: 'general' },
    ],
  },
  {
    year: '24',
    semester: '2',
    slots: [
      { day: '월', time: '10:30', period: '22', subject: '운영체제', courseCode: 'CS301', room: 'IT-401', credits: 3, type: 'major' },
      { day: '월', time: '14:00', period: '6', subject: '논리학', courseCode: 'PHI201', room: '본-307', credits: 2, type: 'general' },
      { day: '화', time: '09:00', period: '21', subject: '알고리즘', courseCode: 'CS302', room: 'IT-302', credits: 3, type: 'major' },
      { day: '화', time: '12:00', period: '23', subject: '웹프로그래밍', courseCode: 'CS205', room: 'IT-205', credits: 3, type: 'major' },
      { day: '수', time: '10:30', period: '22', subject: '운영체제', courseCode: 'CS301', room: 'IT-401', credits: 3, type: 'major' },
      { day: '수', time: '15:00', period: '25', subject: '데이터베이스', courseCode: 'CS303', room: 'IT-303', credits: 3, type: 'major' },
      { day: '목', time: '09:00', period: '21', subject: '알고리즘', courseCode: 'CS302', room: 'IT-302', credits: 3, type: 'major' },
      { day: '목', time: '12:00', period: '23', subject: '컴퓨터네트워크', courseCode: 'CS404', room: 'IT-404', credits: 3, type: 'major' },
      { day: '금', time: '10:00', period: '2', subject: '확��과통계', courseCode: 'STAT201', room: '복-410', credits: 3, type: 'general' },
    ],
  },
];

const initialAITimetable = {
  id: '1',
  createdAt: '2025-11-01 14:30',
  slots: [
    { day: '월', time: '09:00', period: '21', subject: '자료구조', courseCode: 'CS201', room: 'IT-301', credits: 3, type: 'major' },
    { day: '월', time: '10:00', period: '22', subject: '자료구조', courseCode: 'CS201', room: 'IT-301', credits: 3, type: 'major' },
    { day: '월', time: '12:00', period: '23', subject: '운영체제', courseCode: 'CS301', room: 'IT-205', credits: 3, type: 'major' },
    { day: '화', time: '10:00', period: '22', subject: '알고리즘', courseCode: 'CS302', room: 'IT-402', credits: 3, type: 'major' },
    { day: '화', time: '13:00', period: '5', subject: '영어회화', courseCode: 'ENG101', room: '어-201', credits: 2, type: 'general' },
    { day: '수', time: '09:00', period: '21', subject: '데이터베이스', courseCode: 'CS303', room: 'IT-301', credits: 3, type: 'major' },
    { day: '수', time: '10:00', period: '22', subject: '데이터베이스', courseCode: 'CS303', room: 'IT-301', credits: 3, type: 'major' },
    { day: '수', time: '13:00', period: '24', subject: '소프트웨어공학', courseCode: 'CS401', room: 'IT-103', credits: 3, type: 'major' },
    { day: '목', time: '12:00', period: '23', subject: '인공지능', courseCode: 'CS501', room: 'IT-501', credits: 3, type: 'major' },
    { day: '목', time: '13:00', period: '24', subject: '인공지능', courseCode: 'CS501', room: 'IT-501', credits: 3, type: 'major' },
    { day: '목', time: '15:00', period: '25', subject: '컴퓨터그래픽스', courseCode: 'CS404', room: 'IT-404', credits: 3, type: 'major' },
    { day: '금', time: '10:00', period: '22', subject: '웹프로그래밍', courseCode: 'CS204', room: 'IT-204', credits: 3, type: 'major' },
    { day: '금', time: '11:00', period: '23', subject: '웹프로그래밍', courseCode: 'CS204', room: 'IT-204', credits: 3, type: 'major' },
    { day: '금', time: '12:00', period: '4', subject: '경영학개론', courseCode: 'BUS101', room: '경-103', credits: 2, type: 'general' },
  ] as TimeSlot[],
};

export default function ProfileScreen({ user, setUser, navigate, onEditTimetable }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState('previous');
  const [selectedTimetable, setSelectedTimetable] = useState<{ slots: TimeSlot[], title: string } | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAddTimetableDialog, setShowAddTimetableDialog] = useState(false);
  const [previousTimetables, setPreviousTimetables] = useState<TimetableData[]>(initialPreviousTimetables);
  const [aiTimetable, setAiTimetable] = useState<typeof initialAITimetable | null>(initialAITimetable);

  // Fetch my profile from API on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyProfile();
        if (!mounted) return;
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

  const handleUpgradeToPremium = () => {
    setUser({
      ...user,
      plan: 'premium',
    });
  };

  const handleAddTimetable = (year: string, semester: string) => {
    const newTimetable: TimetableData = {
      year,
      semester,
      slots: [],
    };
    setPreviousTimetables([...previousTimetables, newTimetable]);
    toast.success(`20${year}학년도 ${semester}학기 시간표가 추가되었습니다.`);
  };

  const handleDeleteTimetable = (index: number) => {
    const newTimetables = previousTimetables.filter((_, i) => i !== index);
    setPreviousTimetables(newTimetables);
    toast.success('시간표가 삭제되었습니다.');
  };

  const handleDeleteAITimetable = () => {
    setAiTimetable(null);
    toast.success('AI 시간표가 삭제되었습니다.');
  };

  const handleAddAITimetable = () => {
    if (user.plan === 'free' && aiTimetable !== null) {
      // 무료 플랜이고 이미 시간표가 있으면 업그레이드 유도
      setShowPurchaseModal(true);
      toast.error('무료 플랜은 AI 시간표를 1개만 생성할 수 있습니다.');
    } else {
      // 프리미엄이거나 시간표가 없으면 생성 (여기서는 샘플로 채팅봇으로 이동)
      navigate('chatbot');
    }
  };

  const renderTimetableCard = (slots: TimeSlot[], index: number, title: string, showDelete: boolean = false) => {
    const { majorCredits, generalCredits, totalCredits } = calculateCredits(slots);

    return (
      <Card key={index} className="p-4 hover:shadow-[0_0_30px_rgba(140,69,255,0.3)] transition-all bg-black/60 backdrop-blur-md border-white/15">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="text-white">{title}</h4>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="text-purple-400">전공 {majorCredits}학점</span>
              <span className="text-blue-400">교양 {generalCredits}학점</span>
              <span className="text-white/60">총 {totalCredits}학점</span>
            </div>
          </div>
          <div className="flex gap-2">
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
              onClick={() => onEditTimetable({ title, slots })}
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
                    return renderTimetableCard(
                      timetable.slots, 
                      index, 
                      `${timetable.year}학년도 ${semesterLabel}`,
                      true // showDelete
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

              {/* Add AI Timetable Button */}
              {!aiTimetable && (
                <Card className="p-12 text-center bg-black/40 backdrop-blur-md border-white/10 border-dashed">
                  <div className="mx-auto size-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="size-8 text-purple-400" />
                  </div>
                  <h3 className="text-white mb-2">AI 시간표를 만들어보세요</h3>
                  <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                    AI와 채팅하여 나에게 맞는 완벽한 시간표를 몇 초 만에 생성하세요
                  </p>
                  <Button
                    onClick={handleAddAITimetable}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]"
                  >
                    <Sparkles className="size-4" />
                    AI 시간표 생성하기
                  </Button>
                </Card>
              )}

              {/* AI Timetable */}
              {aiTimetable && (
                <div className="grid gap-4">
                  <Card className="p-4 hover:shadow-[0_0_30px_rgba(140,69,255,0.3)] transition-all bg-black/60 backdrop-blur-md border-white/15">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white">AI 생성 시간표</h4>
                        <p className="text-xs text-white/50 mt-1">{aiTimetable.createdAt}</p>
                        <div className="flex items-center gap-3 text-xs mt-1">
                          {(() => {
                            const { majorCredits, generalCredits, totalCredits } = calculateCredits(aiTimetable.slots);
                            return (
                              <>
                                <span className="text-purple-400">전공 {majorCredits}학점</span>
                                <span className="text-blue-400">교양 {generalCredits}학점</span>
                                <span className="text-white/60">총 {totalCredits}학점</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => setSelectedTimetable({ slots: aiTimetable.slots, title: 'AI 생성 시간표' })}
                        >
                          <Maximize2 className="size-3" />
                          확대
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => onEditTimetable({ title: 'AI 생성 시간표', slots: aiTimetable.slots })}
                        >
                          <Edit2 className="size-3" />
                          수정
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                          onClick={handleDeleteAITimetable}
                        >
                          <Trash2 className="size-3" />
                          삭제
                        </Button>
                      </div>
                    </div>
                    <div className="h-[450px] rounded-lg overflow-hidden bg-black/40">
                      <TimetableGrid timetable={aiTimetable.slots} />
                    </div>
                  </Card>
                </div>
              )}
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