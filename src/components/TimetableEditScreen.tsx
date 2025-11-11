import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Save, Plus, Trash2, Edit2, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import TimetableGrid from './TimetableGrid';
import CourseSearchDialog from './CourseSearchDialog';

interface TimeSlot {
  day: string;
  time: string;
  subject: string;
  room: string;
  credits?: number;
  type?: 'major' | 'general';
  courseCode?: string;
  period?: string;
  periods?: string[];
}

interface TimetableEditScreenProps {
  timetable: {
    title: string;
    slots: TimeSlot[];
  };
  onSave: (slots: TimeSlot[]) => void;
  onCancel: () => void;
}

// 교양 교시 (1-9교시)
const GENERAL_PERIODS: { [key: string]: { time: string; range: string } } = {
  '1': { time: '09:00', range: '09:00~09:50' },
  '2': { time: '10:00', range: '10:00~10:50' },
  '3': { time: '11:00', range: '11:00~11:50' },
  '4': { time: '12:00', range: '12:00~12:50' },
  '5': { time: '13:00', range: '13:00~13:50' },
  '6': { time: '14:00', range: '14:00~14:50' },
  '7': { time: '15:00', range: '15:00~15:50' },
  '8': { time: '16:00', range: '16:00~16:50' },
  '9': { time: '17:00', range: '17:00~17:50' },
};

// 전공 교시 (21-26교시)
const MAJOR_PERIODS: { [key: string]: { time: string; range: string } } = {
  '21': { time: '09:00', range: '09:00~10:15' },
  '22': { time: '10:30', range: '10:30~11:45' },
  '23': { time: '12:00', range: '12:00~13:15' },
  '24': { time: '13:30', range: '13:30~14:45' },
  '25': { time: '15:00', range: '15:00~16:15' },
  '26': { time: '16:30', range: '16:30~17:45' },
};

export default function TimetableEditScreen({ timetable, onSave, onCancel }: TimetableEditScreenProps) {
  const [slots, setSlots] = useState<TimeSlot[]>(timetable.slots);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [searchCourseType, setSearchCourseType] = useState<'major' | 'general'>('major');
  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleEdit = (courseCode: string, subject: string) => {
    // 같은 courseCode와 subject를 가진 모든 슬롯 찾기
    const courseSlots = slots.filter(slot => 
      slot.courseCode === courseCode && slot.subject === subject
    );
    
    if (courseSlots.length === 0) return;

    const firstSlot = courseSlots[0];
    
    setEditingCourseId(courseCode);
    setSearchCourseType(firstSlot.type || 'major');
    setIsSearchDialogOpen(true);
  };

  const handleDelete = (courseCode: string, subject: string) => {
    const newSlots = slots.filter(slot => 
      !(slot.courseCode === courseCode && slot.subject === subject)
    );
    setSlots(newSlots);
    toast.success('과목이 삭제되었습니다.');
  };

  const handleSave = () => {
    onSave(slots);
    toast.success('시간표가 저장되었습니다.');
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        const newSlots: TimeSlot[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 6) continue;

          // CSV 형식: 과목명,학수번호,요일+교시,학점,구분,강의실
          // 요일+교시 예: 월21;화22;수23
          const [subject, courseCode, dayPeriodsStr, credits, type, room] = values;
          
          if (!subject || !courseCode || !dayPeriodsStr) continue;

          const courseType = type === '전공' ? 'major' : 'general';
          const periods = courseType === 'major' ? MAJOR_PERIODS : GENERAL_PERIODS;
          
          // 요일+교시 파싱
          const dayPeriodPairs = dayPeriodsStr.split(';');
          dayPeriodPairs.forEach(pair => {
            const day = pair.charAt(0);
            const period = pair.slice(1);
            const periodInfo = periods[period];
            if (periodInfo) {
              newSlots.push({
                subject,
                courseCode,
                day,
                time: periodInfo.time,
                period,
                credits: parseInt(credits) || 3,
                type: courseType,
                room: room || '',
              });
            }
          });
        }

        if (newSlots.length > 0) {
          setSlots(newSlots);
          toast.success(`${newSlots.length}개의 시간대가 추가되었습니다.`);
        } else {
          toast.error('유효한 데이터를 찾을 수 없습니다.');
        }
      } catch (error) {
        toast.error('CSV 파일을 읽는 중 오류가 발생했습니다.');
        console.error(error);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    const template = '과목명,학수번호,요일+교시,학점,구분,강의실\n프로그래밍기초,CS101,월21;수21,3,전공,IT-101\n글쓰기,KOR101,화1;목2,2,교양,본-205';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '시간표_템플릿.csv';
    link.click();
  };

  const calculateCredits = () => {
    // 과목별로 그룹화하여 중복 제거
    const uniqueCourses = new Map<string, TimeSlot>();
    slots.forEach(slot => {
      const key = `${slot.courseCode}-${slot.subject}`;
      if (!uniqueCourses.has(key)) {
        uniqueCourses.set(key, slot);
      }
    });

    let majorCredits = 0;
    let generalCredits = 0;
    
    uniqueCourses.forEach(slot => {
      if (slot.type === 'major') {
        majorCredits += slot.credits || 0;
      } else {
        generalCredits += slot.credits || 0;
      }
    });
    
    return { majorCredits, generalCredits, totalCredits: majorCredits + generalCredits };
  };

  const { majorCredits, generalCredits, totalCredits } = calculateCredits();

  const handleCourseSelect = (course: any) => {
    // Parse day periods from course (e.g., "수23,24" -> [{day: "수", period: "23"}, {day: "수", period: "24"}])
    const newSlots: TimeSlot[] = [];
    const periods = course.type === 'major' ? MAJOR_PERIODS : GENERAL_PERIODS;
    
    if (course.dayPeriods) {
      // Parse format like "수23,24" or "월21,수21"
      const parts = course.dayPeriods.split(',');
      let currentDay = '';
      
      parts.forEach((part: string) => {
        part = part.trim();
        // Check if this part starts with a day character
        const dayMatch = part.match(/^([월화수목금])/);
        if (dayMatch) {
          currentDay = dayMatch[1];
          const periodNum = part.substring(1);
          const periodInfo = periods[periodNum];
          if (periodInfo) {
            newSlots.push({
              day: currentDay,
              time: periodInfo.time,
              period: periodNum,
              subject: course.name,
              courseCode: course.code,
              room: course.room,
              credits: course.credits,
              type: course.type,
            });
          }
        } else {
          // Just a period number, use current day
          const periodInfo = periods[part];
          if (periodInfo && currentDay) {
            newSlots.push({
              day: currentDay,
              time: periodInfo.time,
              period: part,
              subject: course.name,
              courseCode: course.code,
              room: course.room,
              credits: course.credits,
              type: course.type,
            });
          }
        }
      });
    }

    if (editingCourseId !== null) {
      // 수정 모드: 같은 courseCode를 가진 기존 슬롯들을 모두 삭제하고 새로 추가
      const filteredSlots = slots.filter(slot => 
        !(slot.courseCode === editingCourseId)
      );
      setSlots([...filteredSlots, ...newSlots]);
      toast.success('과목이 수정되었습니다.');
      setEditingCourseId(null);
    } else {
      setSlots([...slots, ...newSlots]);
      toast.success('과목이 추가되었습니다.');
    }
  };

  // 과목별로 그룹화
  const groupedCourses = new Map<string, TimeSlot[]>();
  slots.forEach(slot => {
    const key = `${slot.courseCode}-${slot.subject}`;
    if (!groupedCourses.has(key)) {
      groupedCourses.set(key, []);
    }
    groupedCourses.get(key)!.push(slot);
  });

  const formatDayPeriods = (courseSlots: TimeSlot[]) => {
    return courseSlots
      .map(slot => `${slot.day} ${slot.period}교시`)
      .join(', ');
  };

  return (
    <div className="min-h-screen p-6 bg-[#020103] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 size-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 size-96 bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 mb-2"
            >
              <ArrowLeft className="size-4" />
              돌아가기
            </Button>
            <h1 className="text-white text-2xl ml-2">{timetable.title} 수정</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-purple-400">전공 {majorCredits}학점</span>
              <span className="text-blue-400">교양 {generalCredits}학점</span>
              <span className="text-white">총 {totalCredits}학점</span>
            </div>
            <Button
              onClick={downloadCSVTemplate}
              variant="outline"
              className="gap-2 bg-white/5 border-white/15 text-white hover:bg-white/10"
            >
              <Download className="size-4" />
              CSV 템플릿
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2 bg-white/5 border-white/15 text-white hover:bg-white/10"
            >
              <Upload className="size-4" />
              CSV 업로드
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            <Button
              onClick={() => {
                setEditingCourseId(null);
                setSearchCourseType('major');
                setIsSearchDialogOpen(true);
              }}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]"
            >
              <Plus className="size-4" />
              과목 추가
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timetable Grid */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-black/60 backdrop-blur-md border-white/15 h-[600px]">
              <TimetableGrid timetable={slots} />
            </Card>
          </div>

          {/* Course List */}
          <div className="space-y-4">
            <Card className="p-6 bg-black/60 backdrop-blur-md border-white/15">
              <h3 className="text-white mb-4">과목 목록 ({groupedCourses.size}개)</h3>
              <div className="space-y-2 max-h-[450px] overflow-y-auto">
                {groupedCourses.size === 0 ? (
                  <div className="text-center text-white/40 py-8">
                    <p className="text-sm">등록된 과목이 없습니다.</p>
                    <p className="text-xs mt-2">과목 추가 버튼을 눌러 시작하세요.</p>
                  </div>
                ) : (
                  Array.from(groupedCourses.entries()).map(([key, courseSlots], index) => {
                    const slot = courseSlots[0];
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 border border-purple-500/30 backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="text-white text-sm mb-1">{slot.subject}</div>
                            <div className="text-xs text-white/70">
                              {slot.courseCode && `${slot.courseCode} · `}
                              {formatDayPeriods(courseSlots)}
                            </div>
                            <div className="text-xs text-white/60 mt-1">
                              {slot.credits}학점 · {slot.type === 'major' ? '전공' : '교양'}
                              {slot.room && ` · ${slot.room}`}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slot.courseCode || '', slot.subject)}
                              className="size-7 p-0 text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <Edit2 className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slot.courseCode || '', slot.subject)}
                              className="size-7 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]"
              >
                <Save className="size-4" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Search Dialog */}
      <CourseSearchDialog
        open={isSearchDialogOpen}
        onClose={() => {
          setIsSearchDialogOpen(false);
          setEditingCourseId(null);
        }}
        onSelect={handleCourseSelect}
        courseType={searchCourseType}
      />
    </div>
  );
}
