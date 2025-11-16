import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import TimetableGrid from './TimetableGrid';
import Logo from './Logo';
import { toast } from 'sonner';

interface TimeSlot {
  day: string;
  time: string;
  subject: string;
  room: string;
  credits: number;
  type: 'major' | 'general';
}

interface SeniorTimetable {
  id: number;
  name: string;
  studentId: string;
  department: string;
  year: string;
  semester: string;
  academicYear: string; // 학년도
  gpa: number;
  slots: TimeSlot[];
}

interface SeniorTimetablesScreenProps {
  navigate: (screen: any) => void;
}

export default function SeniorTimetablesScreen({ navigate }: SeniorTimetablesScreenProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const seniorTimetables: SeniorTimetable[] = [
    {
      id: 1,
      name: '김민수',
      studentId: '20220001',
      department: '컴퓨터공학과',
      year: '3학년',
      semester: '1학기',
      academicYear: '2024',
      gpa: 4.12,
      slots: [
        { day: '월', time: '09:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '창의적사고와글쓰기', room: '본-205', credits: 2, type: 'general' },
        { day: '화', time: '10:30', subject: '알고리즘', room: 'IT-302', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: 'English Conversation', room: '어-304', credits: 2, type: 'general' },
        { day: '수', time: '09:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        { day: '수', time: '12:00', subject: '데이터베이스', room: 'IT-303', credits: 3, type: 'major' },
        { day: '목', time: '10:30', subject: '알고리즘', room: 'IT-302', credits: 3, type: 'major' },
        { day: '목', time: '15:00', subject: '소프트웨어공학', room: 'IT-404', credits: 3, type: 'major' },
        { day: '금', time: '11:00', subject: '선형대수', room: '복-208', credits: 3, type: 'general' },
      ],
    },
    {
      id: 2,
      name: '이서연',
      studentId: '20210034',
      department: '컴퓨터공학과',
      year: '4학년',
      semester: '1학기',
      academicYear: '2024',
      gpa: 4.35,
      slots: [
        { day: '월', time: '10:30', subject: '인공지능', room: 'IT-501', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '경영학개론', room: '본-307', credits: 2, type: 'general' },
        { day: '화', time: '09:00', subject: '컴퓨터네트워크', room: 'IT-405', credits: 3, type: 'major' },
        { day: '화', time: '12:00', subject: '딥러닝', room: 'IT-502', credits: 3, type: 'major' },
        { day: '수', time: '10:30', subject: '인공지능', room: 'IT-501', credits: 3, type: 'major' },
        { day: '수', time: '15:00', subject: '머신러닝', room: 'IT-503', credits: 3, type: 'major' },
        { day: '목', time: '09:00', subject: '컴퓨터네트워크', room: 'IT-405', credits: 3, type: 'major' },
        { day: '목', time: '12:00', subject: '컴퓨터비전', room: 'IT-504', credits: 3, type: 'major' },
        { day: '금', time: '10:00', subject: '확률과통계', room: '복-410', credits: 3, type: 'general' },
      ],
    },
    {
      id: 3,
      name: '박준호',
      studentId: '20230125',
      department: '컴퓨터공학과',
      year: '2학년',
      semester: '2학기',
      academicYear: '2024',
      gpa: 3.98,
      slots: [
        { day: '월', time: '09:00', subject: '자료구조', room: 'IT-301', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '논리와비판적사고', room: '본-205', credits: 2, type: 'general' },
        { day: '화', time: '10:00', subject: '이산수학', room: 'IT-202', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '영어회화', room: '어-304', credits: 2, type: 'general' },
        { day: '수', time: '09:00', subject: '자료구조', room: 'IT-301', credits: 3, type: 'major' },
        { day: '수', time: '12:00', subject: '컴퓨터구조', room: 'IT-203', credits: 3, type: 'major' },
        { day: '목', time: '10:00', subject: '이산수학', room: 'IT-202', credits: 3, type: 'major' },
        { day: '목', time: '13:30', subject: 'JAVA프로그래밍', room: 'IT-304', credits: 3, type: 'major' },
        { day: '금', time: '11:00', subject: '미적분학', room: '복-208', credits: 3, type: 'general' },
      ],
    },
    {
      id: 4,
      name: '정하은',
      studentId: '20220078',
      department: '경영학과',
      year: '3학년',
      semester: '1학기',
      academicYear: '2024',
      gpa: 4.21,
      slots: [
        { day: '월', time: '09:00', subject: '재무관리', room: '경-201', credits: 3, type: 'major' },
        { day: '월', time: '12:00', subject: '마케팅원론', room: '경-305', credits: 3, type: 'major' },
        { day: '화', time: '10:30', subject: '조직행동론', room: '경-204', credits: 3, type: 'major' },
        { day: '화', time: '15:00', subject: '경제학원론', room: '경-102', credits: 3, type: 'general' },
        { day: '수', time: '09:00', subject: '���무관리', room: '경-201', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: '회계학원론', room: '경-301', credits: 3, type: 'major' },
        { day: '목', time: '10:30', subject: '조직행동론', room: '경-204', credits: 3, type: 'major' },
        { day: '금', time: '11:00', subject: '통계학', room: '복-305', credits: 3, type: 'general' },
      ],
    },
    {
      id: 5,
      name: '최윤아',
      studentId: '20230089',
      department: '경영학과',
      year: '2학년',
      semester: '1학기',
      academicYear: '2024',
      gpa: 3.87,
      slots: [
        { day: '월', time: '10:00', subject: '경영정보시스템', room: '경-203', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '경영학원론', room: '경-101', credits: 3, type: 'major' },
        { day: '화', time: '09:00', subject: '미시경제학', room: '경-405', credits: 3, type: 'general' },
        { day: '화', time: '13:00', subject: '비즈니스영어', room: '어-201', credits: 2, type: 'general' },
        { day: '수', time: '10:00', subject: '경영정보시스템', room: '경-203', credits: 3, type: 'major' },
        { day: '수', time: '15:00', subject: '인사관리', room: '경-302', credits: 3, type: 'major' },
        { day: '목', time: '09:00', subject: '미시경제학', room: '경-405', credits: 3, type: 'general' },
        { day: '금', time: '10:00', subject: '회계원리', room: '경-304', credits: 3, type: 'major' },
      ],
    },
    {
      id: 6,
      name: '강태현',
      studentId: '20210056',
      department: '경영학과',
      year: '4학년',
      semester: '2학기',
      academicYear: '2023',
      gpa: 4.08,
      slots: [
        { day: '월', time: '09:00', subject: '전략경영', room: '경-501', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '국제경영', room: '경-503', credits: 3, type: 'major' },
        { day: '화', time: '10:30', subject: '재무분석', room: '경-401', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '경영윤리', room: '경-202', credits: 2, type: 'general' },
        { day: '수', time: '09:00', subject: '전략경영', room: '경-501', credits: 3, type: 'major' },
        { day: '목', time: '10:30', subject: '재무분석', room: '경-401', credits: 3, type: 'major' },
        { day: '목', time: '15:00', subject: '벤처창업론', room: '경-504', credits: 3, type: 'major' },
        { day: '금', time: '11:00', subject: '경영전략사례', room: '경-502', credits: 3, type: 'major' },
      ],
    },
    {
      id: 7,
      name: '송지우',
      studentId: '20220145',
      department: '컴퓨터공학과',
      year: '3학년',
      semester: '2학기',
      academicYear: '2023',
      gpa: 3.92,
      slots: [
        { day: '월', time: '10:00', subject: '웹프로그래밍', room: 'IT-305', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '시스템분석설계', room: 'IT-403', credits: 3, type: 'major' },
        { day: '화', time: '09:00', subject: '컴퓨터그래픽스', room: 'IT-404', credits: 3, type: 'major' },
        { day: '화', time: '13:00', subject: '확률과통계', room: '복-305', credits: 3, type: 'general' },
        { day: '수', time: '10:00', subject: '웹프로그래밍', room: 'IT-305', credits: 3, type: 'major' },
        { day: '수', time: '15:00', subject: '모바일프로그래밍', room: 'IT-306', credits: 3, type: 'major' },
        { day: '목', time: '09:00', subject: '컴퓨터그래픽스', room: 'IT-404', credits: 3, type: 'major' },
        { day: '금', time: '11:00', subject: '데이터통신', room: 'IT-307', credits: 3, type: 'major' },
      ],
    },
    {
      id: 8,
      name: '한서진',
      studentId: '20230201',
      department: '경영학과',
      year: '2학년',
      semester: '2학기',
      academicYear: '2023',
      gpa: 4.15,
      slots: [
        { day: '월', time: '09:00', subject: '마케팅조사론', room: '경-206', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '생산운영관리', room: '경-208', credits: 3, type: 'major' },
        { day: '화', time: '10:00', subject: '소비자행동론', room: '경-306', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '경영통계', room: '경-103', credits: 3, type: 'general' },
        { day: '수', time: '09:00', subject: '마케팅조사론', room: '경-206', credits: 3, type: 'major' },
        { day: '수', time: '12:00', subject: '재무회계', room: '경-307', credits: 3, type: 'major' },
        { day: '목', time: '10:00', subject: '소비자행동론', room: '경-306', credits: 3, type: 'major' },
        { day: '금', time: '11:00', subject: '경영분석', room: '경-205', credits: 3, type: 'major' },
      ],
    },
  ];

  // 필터링된 시간표
  const filteredTimetables = seniorTimetables.filter((timetable) => {
    const yearMatch = selectedYear === 'all' || timetable.academicYear === selectedYear;
    const departmentMatch = selectedDepartment === 'all' || timetable.department === selectedDepartment;
    const gradeMatch = selectedGrade === 'all' || timetable.year === selectedGrade;
    return yearMatch && departmentMatch && gradeMatch;
  });

  const handleUseTimetable = (name: string) => {
    toast.success(`${name}의 시간표를 참고용으로 저장했습니다.`);
    setTimeout(() => {
      navigate('chatbot');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020103] flex flex-col">
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
            onClick={() => navigate('chatbot')}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Logo variant="icon" size="sm" />
        </div>
        <h1 className="text-white text-xl">선배들의 시간표</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-center">
            <p className="text-white/60 mb-6">
              선배들의 시간표를 참고하여 자신의 시간표를 계획해보세요
            </p>

            {/* Filters */}
            <div className="flex items-center justify-center gap-3">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px] bg-black/40 border-white/15 text-white">
                  <SelectValue placeholder="학년도" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="all">전체 학년도</SelectItem>
                  <SelectItem value="2024">2024학년도</SelectItem>
                  <SelectItem value="2023">2023학년도</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[160px] bg-black/40 border-white/15 text-white">
                  <SelectValue placeholder="학과" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="all">전체 학과</SelectItem>
                  <SelectItem value="컴퓨터공학과">컴퓨터공학과</SelectItem>
                  <SelectItem value="경영학과">경영학과</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[140px] bg-black/40 border-white/15 text-white">
                  <SelectValue placeholder="학년" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="all">전체 학년</SelectItem>
                  <SelectItem value="2학년">2학년</SelectItem>
                  <SelectItem value="3학년">3학년</SelectItem>
                  <SelectItem value="4학년">4학년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-center text-white/50 text-sm">
            {filteredTimetables.length}개의 시간표
          </div>

          {/* Timetables Grid - 2 columns */}
          {filteredTimetables.length === 0 ? (
            <Card className="p-12 text-center bg-black/40 backdrop-blur-md border-white/10 border-dashed">
              <p className="text-white/60">해당 조건의 시간표가 없습니다</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {filteredTimetables.map((timetable) => (
                <Card 
                  key={timetable.id} 
                  className="bg-black/60 backdrop-blur-md border-white/15 overflow-hidden flex flex-col"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-white/10 bg-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white mb-1">{timetable.name}</h3>
                        <p className="text-white/50 text-sm">{timetable.department}</p>
                        <p className="text-white/40 text-xs mt-1">
                          {timetable.studentId} · {timetable.year} · {timetable.academicYear}년 {timetable.semester}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 text-sm">평균 학점</div>
                        <div className="text-white">{timetable.gpa}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUseTimetable(timetable.name)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-10"
                    >
                      이 시간표 참고하기
                    </Button>
                  </div>

                  {/* Timetable */}
                  <div className="flex-1 p-5">
                    <div className="h-[500px] rounded-lg overflow-hidden bg-black/40 border border-white/10">
                      <TimetableGrid timetable={timetable.slots} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}