import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';

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
}

// Mock course data
const MOCK_COURSES: Course[] = [
  {
    id: '1',
    name: 'C++프로그래밍',
    code: 'EN1003-01',
    professor: '김태영',
    dayPeriods: '수23,24',
    room: '복-521',
    year: '2학년',
    type: 'major',
    category: '전심',
    credits: 3,
  },
  {
    id: '2',
    name: 'C++프로그래밍',
    code: 'EN1003-02',
    professor: '안경찬',
    dayPeriods: '수23,24',
    room: '복-320',
    year: '2학년',
    type: 'major',
    category: '전심',
    credits: 3,
  },
  {
    id: '3',
    name: 'C++프로그래밍',
    code: 'CE1102-01',
    professor: '김태영',
    dayPeriods: '복-521',
    room: '복-521',
    year: '1,2,3,4학년',
    type: 'major',
    category: '전심',
    credits: 3,
  },
  {
    id: '4',
    name: 'C언어및실습',
    code: 'GE8575-01',
    professor: '',
    dayPeriods: '자선',
    room: '',
    year: '전체학년',
    type: 'general',
    category: '교양',
    credits: 3,
  },
  {
    id: '5',
    name: '예제로배우는C언어',
    code: 'GE8632-01',
    professor: '',
    dayPeriods: '자선',
    room: '',
    year: '전체학년',
    type: 'general',
    category: '교양',
    credits: 3,
  },
  {
    id: '6',
    name: '자료구조',
    code: 'CS201-01',
    professor: '이민수',
    dayPeriods: '월21,22',
    room: 'IT-301',
    year: '2학년',
    type: 'major',
    category: '전공필수',
    credits: 3,
  },
  {
    id: '7',
    name: '알고리즘',
    code: 'CS302-01',
    professor: '박지훈',
    dayPeriods: '화21,수21',
    room: 'IT-302',
    year: '3학년',
    type: 'major',
    category: '전공필수',
    credits: 3,
  },
  {
    id: '8',
    name: '운영체제',
    code: 'CS301-01',
    professor: '최영희',
    dayPeriods: '월22,수22',
    room: 'IT-401',
    year: '3학년',
    type: 'major',
    category: '전공필수',
    credits: 3,
  },
  {
    id: '9',
    name: '데이터베이스',
    code: 'CS303-01',
    professor: '정수진',
    dayPeriods: '수25,목23',
    room: 'IT-303',
    year: '3학년',
    type: 'major',
    category: '전공선택',
    credits: 3,
  },
  {
    id: '10',
    name: '웹프로그래밍',
    code: 'CS204-01',
    professor: '강민호',
    dayPeriods: '금22,23',
    room: 'IT-204',
    year: '2학년',
    type: 'major',
    category: '전공선택',
    credits: 3,
  },
  {
    id: '11',
    name: '영어회화',
    code: 'ENG101-01',
    professor: 'John Smith',
    dayPeriods: '화5,목5',
    room: '어-201',
    year: '전체학년',
    type: 'general',
    category: '교양필수',
    credits: 2,
  },
  {
    id: '12',
    name: '글쓰기와의사소통',
    code: 'KOR101-01',
    professor: '김문정',
    dayPeriods: '월5,수5',
    room: '본-205',
    year: '1학년',
    type: 'general',
    category: '교양필수',
    credits: 2,
  },
];

export default function CourseSearchDialog({ open, onClose, onSelect, courseType }: CourseSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedYear, setSelectedYear] = useState('전체');
  const [selectedCredits, setSelectedCredits] = useState('전체');

  // Filter courses
  const filteredCourses = MOCK_COURSES.filter(course => {
    if (course.type !== courseType) return false;
    
    if (searchQuery && !course.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (selectedCategory !== '전체' && course.category !== selectedCategory) {
      return false;
    }

    if (selectedYear !== '전체' && !course.year.includes(selectedYear)) {
      return false;
    }

    if (selectedCredits !== '전체' && course.credits.toString() !== selectedCredits) {
      return false;
    }

    return true;
  });

  const handleSelectCourse = (course: Course) => {
    onSelect(course);
    onClose();
    // Reset filters
    setSearchQuery('');
    setSelectedCategory('전체');
    setSelectedYear('전체');
    setSelectedCredits('전체');
  };

  const categories = courseType === 'major' 
    ? ['전체', '전공필수', '전공선택', '전심']
    : ['전체', '교양필수', '교양선택', '교양'];

  const years = ['전체', '1학년', '2학년', '3학년', '4학년'];
  const credits = ['전체', '1', '2', '3', '4'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-white">과목 검색</DialogTitle>
          <DialogDescription className="text-white/60">
            과목명, 학수번호, 교수명으로 검색하여 시간표에 추가할 수 있습니다.
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
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">전공/영역:</span>
              <div className="flex gap-1">
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

            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">학년:</span>
              <div className="flex gap-1">
                {years.map(year => (
                  <Button
                    key={year}
                    size="sm"
                    variant={selectedYear === year ? 'default' : 'outline'}
                    onClick={() => setSelectedYear(year)}
                    className={
                      selectedYear === year
                        ? 'bg-purple-600 hover:bg-purple-500 text-white h-7 text-xs'
                        : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 h-7 text-xs'
                    }
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            {/* Credits Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">학점:</span>
              <div className="flex gap-1">
                {credits.map(credit => (
                  <Button
                    key={credit}
                    size="sm"
                    variant={selectedCredits === credit ? 'default' : 'outline'}
                    onClick={() => setSelectedCredits(credit)}
                    className={
                      selectedCredits === credit
                        ? 'bg-purple-600 hover:bg-purple-500 text-white h-7 text-xs'
                        : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 h-7 text-xs'
                    }
                  >
                    {credit}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== '전체' || selectedYear !== '전체' || selectedCredits !== '전체') && (
            <div className="flex flex-wrap gap-2 items-center">
              {searchQuery && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded text-xs text-white">
                  과목명: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:bg-white/10 rounded-full p-0.5">
                    <X className="size-3" />
                  </button>
                </div>
              )}
              {selectedCategory !== '전체' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded text-xs text-white">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('전체')} className="hover:bg-white/10 rounded-full p-0.5">
                    <X className="size-3" />
                  </button>
                </div>
              )}
              {selectedYear !== '전체' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded text-xs text-white">
                  {selectedYear}
                  <button onClick={() => setSelectedYear('전체')} className="hover:bg-white/10 rounded-full p-0.5">
                    <X className="size-3" />
                  </button>
                </div>
              )}
              {selectedCredits !== '전체' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded text-xs text-white">
                  {selectedCredits}학점
                  <button onClick={() => setSelectedCredits('전체')} className="hover:bg-white/10 rounded-full p-0.5">
                    <X className="size-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="px-6 pb-6 flex-1 overflow-hidden">
          <div className="text-sm text-white/60 mb-3">
            검색 결과 {filteredCourses.length}개
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredCourses.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelectCourse(course)}
                  className="p-4 bg-black/60 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 border border-white/10 hover:border-purple-500/50 rounded-lg cursor-pointer transition-all"
                >
                  <div className="mb-2">
                    <h4 className="text-white mb-1">{course.name}</h4>
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
                      {course.year} {course.category} {course.credits}학점 {course.code}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
