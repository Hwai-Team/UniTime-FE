import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Search, X, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { searchCourses, type CourseItem } from '../lib/api';

interface Course {
  id: string;
  name: string;
  code: string;
  professor: string;
  dayPeriods: string;
  room: string;
  year: string;
  type: 'major' | 'general';
  category: string;
  credits: number;
}

interface CourseSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (course: Course) => void;
  courseType: 'major' | 'general';
  existingSlots?: Array<{
    day: string;
    period: string;
  }>;
}

// util: API -> UI 매핑
function mapCourse(item: CourseItem): Course {
  const dayMap: Record<string, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' };
  const day = dayMap[item.dayOfWeek] || item.dayOfWeek;
  const period = item.startPeriod === item.endPeriod ? String(item.startPeriod) : `${item.startPeriod},${item.endPeriod}`;
  const yearLabel = item.gradeYear ? `${item.gradeYear}학년` : '전체학년';
  return {
    id: String(item.id),
    name: item.name,
    code: item.courseCode + (item.section ? `-${item.section}` : ''),
    professor: item.professor || '',
    dayPeriods: `${day}${period}`,
    room: item.room || '',
    year: yearLabel,
    // 전공 분류 확장: 전필/전선/전심/전핵/전공 은 모두 major 취급
    type: ['전필', '전선', '전심', '전핵', '전공'].includes(item.category) ? 'major' : 'general',
    category: item.category,
    credits: item.credit,
  };
}

export default function CourseSearchDialog({ open, onClose, onSelect, courseType, existingSlots = [] }: CourseSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [gradeYear, setGradeYear] = useState<string>('');
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const res = await searchCourses({
          keyword: searchQuery || undefined,
          category: selectedCategory === '전체' ? undefined : selectedCategory,
          gradeYear: gradeYear ? Number(gradeYear) : undefined,
        });
        setItems(res.map(mapCourse));
      } catch (_e) {
        setError('강의 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open, searchQuery, selectedCategory, gradeYear]);

  // 시간 겹침 체크 함수
  const checkTimeConflict = (dayPeriods: string): boolean => {
    if (existingSlots.length === 0) return false;

    // dayPeriods 파싱 (예: "월21,22" 또는 "화21,수21")
    const parts = dayPeriods.split(',');
    let currentDay = '';
    const newSlots: Array<{ day: string; period: string }> = [];

    parts.forEach(part => {
      part = part.trim();
      const dayMatch = part.match(/^([월화수목금])/);
      if (dayMatch) {
        currentDay = dayMatch[1];
        const periodNum = part.substring(1);
        if (periodNum) {
          newSlots.push({ day: currentDay, period: periodNum });
        }
      } else {
        // 교시만 있는 경우 (현재 요일 사용)
        if (currentDay && part) {
          newSlots.push({ day: currentDay, period: part });
        }
      }
    });

    // 기존 슬롯과 비교
    for (const newSlot of newSlots) {
      for (const existingSlot of existingSlots) {
        if (newSlot.day === existingSlot.day && newSlot.period === existingSlot.period) {
          return true;
        }
      }
    }

    return false;
  };

  // Show both major/general regardless of opener; category 버튼으로 필터링하므로 전체 표시
  const filteredCourses = useMemo(() => items, [items]);

  // Group by category for sectional view
  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, Course[]>();
    for (const c of filteredCourses) {
      const key = c.category || '기타';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    // Desired order
    const order = ['전핵', '전심', '전필', '전선', '전공', '교필', '교선', '기타'];
    const entries: Array<[string, Course[]]> = Array.from(groups.entries());
    entries.sort((a, b) => order.indexOf(a[0] as any) - order.indexOf(b[0] as any));
    return entries;
  }, [filteredCourses]);

  const handleToggleCourse = (courseId: string) => {
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (!course) return;

    // 시간 겹침 체크
    const hasConflict = checkTimeConflict(course.dayPeriods);
    
    const newSelected = new Set(selectedCourses);
    
    if (newSelected.has(courseId)) {
      // 이미 선택된 경우 해제
      newSelected.delete(courseId);
      setSelectedCourses(newSelected);
    } else {
      // 새로 선택하는 경우
      if (hasConflict) {
        // 시간 겹침 경고
        const confirmAdd = window.confirm(
          `⚠️ 시간표 충돌 경고\n\n"${course.name}" 과목이 기존 시간표와 시간이 겹칩니다.\n\n그래도 추가하시겠습니까?`
        );
        
        if (confirmAdd) {
          newSelected.add(courseId);
          setSelectedCourses(newSelected);
          toast.warning('시간이 겹치는 과목이 추가되었습니다.', {
            description: '시간표를 확인해주세요.',
          });
        }
      } else {
        newSelected.add(courseId);
        setSelectedCourses(newSelected);
      }
    }
  };

  const handleAddSelectedCourses = () => {
    if (selectedCourses.size === 0) {
      toast.error('과목을 선택해주세요.');
      return;
    }

    let conflictCount = 0;
    selectedCourses.forEach(courseId => {
      const course = MOCK_COURSES.find(c => c.id === courseId);
      if (course) {
        if (checkTimeConflict(course.dayPeriods)) {
          conflictCount++;
        }
        onSelect(course);
      }
    });
    
    if (conflictCount > 0) {
      toast.warning(`${selectedCourses.size}개 과목 추가됨`, {
        description: `${conflictCount}개 과목이 시간표와 겹칩니다.`,
      });
    } else {
      toast.success(`${selectedCourses.size}개 과목이 추가되었습니다.`);
    }
    
    // Reset and close
    setSelectedCourses(new Set());
    setSearchQuery('');
    setSelectedCategory('전체');
    onClose();
  };

  const handleCancel = () => {
    setSelectedCourses(new Set());
    setSearchQuery('');
    setSelectedCategory('전체');
    onClose();
  };

  // 모든 카테고리를 하나의 배열로
  const categories = ['전체', '전필', '전선', '교필', '교선'];

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white max-w-2xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-white">과목 검색</DialogTitle>
          <DialogDescription className="text-white/60">
            과목을 선택하여 시간표에 추가할 수 있습니다. (다중 선택 가능)
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="과목명 검색..."
              className="pl-10 bg-black/40 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">카테고리:</span>
              <div className="flex gap-1 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className={
                      selectedCategory === category
                        ? 'bg-purple-600 hover:bg-purple-500 text-white h-7 text-xs'
                        : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 h-7 text-xs'
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">추천 학년:</span>
              <Input
                value={gradeYear}
                onChange={(e) => setGradeYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 1))}
                placeholder="예: 3"
                className="w-20 bg-black/40 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 h-8 text-sm"
              />
            </div>
          </div>

          {/* Selected Count */}
          {selectedCourses.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
              <span className="text-sm text-white">
                {selectedCourses.size}개 선택됨
              </span>
              <button
                onClick={() => setSelectedCourses(new Set())}
                className="text-xs text-white/60 hover:text-white underline"
              >
                전체 해제
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="px-6 flex-1 overflow-hidden">
          <div className="text-sm text-white/60 mb-3">
            {loading ? '검색 중...' : error ? error : `검색 결과 ${filteredCourses.length}개`}
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredCourses.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              groupedByCategory.map(([category, courses]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 sticky top-0 bg-[#020103]/80 backdrop-blur px-1 py-1 z-10">
                    <span className="text-white text-sm">{category}</span>
                    <span className="text-xs text-white/60">({courses.length})</span>
                  </div>
                  {courses.map((course, index) => {
                    const isSelected = selectedCourses.has(course.id);
                    const hasConflict = checkTimeConflict(course.dayPeriods);
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleToggleCourse(course.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-500/70'
                            : 'bg-black/60 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleCourse(course.id)}
                            className="mt-1 border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="mb-2">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="text-white">{course.name}</h4>
                                {hasConflict && (
                                  <span className="text-xs px-2 py-0.5 bg-red-600/30 border border-red-500/50 rounded text-red-300 flex items-center gap-1">
                                    <AlertTriangle className="size-3" />
                                    시간 겹침
                                  </span>
                                )}
                              </div>
                              {course.professor && (
                                <p className="text-sm text-white/70">{course.professor}</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              {course.dayPeriods && (
                                <p className="text-sm text-white/60">{course.dayPeriods}</p>
                              )}
                              {course.room && (
                                <p className="text-sm text-white/60">{course.room}</p>
                              )}
                              <p className="text-xs text-white/50">
                                {course.year} · {course.category} · {course.credits}학점 · {course.code}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-white/10 flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10"
          >
            취소
          </Button>
          <Button
            onClick={handleAddSelectedCourses}
            disabled={selectedCourses.size === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedCourses.size > 0 ? `${selectedCourses.size}개 추가` : '과목 선택'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
