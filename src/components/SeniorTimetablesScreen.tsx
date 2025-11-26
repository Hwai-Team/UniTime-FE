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
  period?: string;
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
  const TIME_TO_PERIOD: Record<string, string> = {
    '10:00': '1',
    '11:00': '2',
    '12:00': '3',
    '13:00': '4',
    '14:00': '5',
    '15:00': '6',
    '16:00': '7',
    '17:00': '8',
    '18:00': '9',
    '11:30': '22',
    '14:30': '24',
    '16:30': '25',
    '17:30': '26',
  };

  // 시간을 +1 시간 늘리는 함수
  const addOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = hours + 1;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 이름을 "김00" 형식으로 변환하는 함수
  const formatName = (name: string): string => {
    if (name.length > 0) {
      return name[0] + '00';
    }
    return name;
  };

  const mapSlotsWithPeriod = (slots: TimeSlot[]) =>
    slots.map((slot) => {
      const newTime = addOneHour(slot.time);
      return (slot.period ? { ...slot, time: newTime } : { ...slot, time: newTime, period: TIME_TO_PERIOD[newTime] ?? '1' });
    });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const seniorTimetables: SeniorTimetable[] = [
    {
      id: 1,
      name: '김00',
      studentId: '20220001',
      department: '컴퓨터공학과',
      year: '3학년',
      semester: '1학기',
      academicYear: '2024',
      gpa: 4.12,
      slots: [
        // 2시간 수업
        { day: '월', time: '10:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        { day: '월', time: '11:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '화', time: '10:00', subject: '알고리즘분석', room: 'IT-302', credits: 3, type: 'major' },
        { day: '화', time: '11:00', subject: '알고리즘분석', room: 'IT-302', credits: 3, type: 'major' },
        { day: '화', time: '13:00', subject: '캡스톤프로젝트', room: 'IT-508', credits: 2, type: 'major' },
        { day: '화', time: '14:00', subject: '캡스톤프로젝트', room: 'IT-508', credits: 2, type: 'major' },
        { day: '화', time: '15:00', subject: '캡스톤프로젝트', room: 'IT-508', credits: 2, type: 'major' },
        { day: '화', time: '16:00', subject: '캡스톤프로젝트', room: 'IT-508', credits: 2, type: 'major' },
        // 2시간 수업
        { day: '수', time: '10:00', subject: '컴퓨터비전', room: 'IT-506', credits: 3, type: 'major' },
        { day: '수', time: '11:00', subject: '컴퓨터비전', room: 'IT-506', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: '컴퓨터비전', room: 'IT-506', credits: 3, type: 'major' },
        { day: '수', time: '14:00', subject: '컴퓨터비전', room: 'IT-506', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '목', time: '10:00', subject: '인공지능실습', room: 'IT-503', credits: 3, type: 'major' },
        { day: '목', time: '11:00', subject: '인공지능실습', room: 'IT-503', credits: 3, type: 'major' },
        { day: '목', time: '13:00', subject: '비즈니스커뮤니케이션', room: '본-105', credits: 2, type: 'general' },
        { day: '목', time: '14:00', subject: '비즈니스커뮤니케이션', room: '본-105', credits: 2, type: 'general' },
      ],
    },
    {
      id: 2,
      name: '이00',
      studentId: '20210034',
      department: '컴퓨터공학과',
      year: '4학년',
      semester: '1학기',
      academicYear: '2024',
      gpa: 4.35,
      slots: [
        // 2시간 수업
        { day: '월', time: '10:00', subject: '분산시스템', room: 'IT-601', credits: 3, type: 'major' },
        { day: '월', time: '11:00', subject: '분산시스템', room: 'IT-601', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '클라우드컴퓨팅', room: 'IT-602', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '클라우드컴퓨팅', room: 'IT-602', credits: 3, type: 'major' },
        { day: '월', time: '15:00', subject: '클라우드컴퓨팅', room: 'IT-602', credits: 3, type: 'major' },
        { day: '월', time: '16:00', subject: '클라우드컴퓨팅', room: 'IT-602', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '화', time: '10:00', subject: '컴퓨터네트워크', room: 'IT-405', credits: 3, type: 'major' },
        { day: '화', time: '11:00', subject: '컴퓨터네트워크', room: 'IT-405', credits: 3, type: 'major' },
        { day: '화', time: '13:00', subject: '데이터마이닝', room: 'IT-407', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '데이터마이닝', room: 'IT-407', credits: 3, type: 'major' },
        { day: '화', time: '15:00', subject: '데이터마이닝', room: 'IT-407', credits: 3, type: 'major' },
        { day: '화', time: '16:00', subject: '데이터마이닝', room: 'IT-407', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '수', time: '10:00', subject: '딥러닝캡스톤', room: 'IT-610', credits: 3, type: 'major' },
        { day: '수', time: '11:00', subject: '딥러닝캡스톤', room: 'IT-610', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: '딥러닝캡스톤', room: 'IT-610', credits: 3, type: 'major' },
        { day: '수', time: '14:00', subject: '딥러닝캡스톤', room: 'IT-610', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '목', time: '10:00', subject: '보안공학', room: 'IT-409', credits: 3, type: 'major' },
        { day: '목', time: '11:00', subject: '보안공학', room: 'IT-409', credits: 3, type: 'major' },
        { day: '목', time: '13:00', subject: '보안공학', room: 'IT-409', credits: 3, type: 'major' },
        { day: '목', time: '14:00', subject: '보안공학', room: 'IT-409', credits: 3, type: 'major' },
      ],
    },
    {
      id: 3,
      name: '박00',
      studentId: '20230125',
      department: '컴퓨터공학과',
      year: '2학년',
      semester: '2학기',
      academicYear: '2024',
      gpa: 3.98,
      slots: [
        // 2시간 수업
        { day: '화', time: '10:00', subject: '알고리즘및실습', room: 'IT-301', credits: 3, type: 'major' },
        { day: '화', time: '11:00', subject: '알고리즘및실습', room: 'IT-301', credits: 3, type: 'major' },
        { day: '화', time: '13:00', subject: '객체지향프로그래밍', room: 'IT-207', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '객체지향프로그래밍', room: 'IT-207', credits: 3, type: 'major' },
        { day: '화', time: '15:00', subject: '스쿼시', room: '체-102', credits: 1, type: 'general' },
        { day: '화', time: '16:00', subject: '스쿼시', room: '체-102', credits: 1, type: 'general' },
        // 2시간 수업
        { day: '수', time: '10:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        { day: '수', time: '11:00', subject: '운영체제', room: 'IT-401', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: 'World English 2', room: '어-204', credits: 2, type: 'general' },
        { day: '수', time: '14:00', subject: 'World English 2', room: '어-204', credits: 2, type: 'general' },
        // 2시간 수업
        { day: '목', time: '10:00', subject: 'Communication', room: '본-105', credits: 2, type: 'general' },
        { day: '목', time: '11:00', subject: 'Communication', room: '본-105', credits: 2, type: 'general' },
        { day: '목', time: '13:00', subject: '자바어플리케이션', room: 'IT-312', credits: 3, type: 'major' },
        { day: '목', time: '14:00', subject: '자바어플리케이션', room: 'IT-312', credits: 3, type: 'major' },
      ],
    },
    {
      id: 4,
      name: '정00',
      studentId: '20220078',
      department: '경영학과',
      year: '3학년',
      semester: '1학기',
      academicYear: '2024',
      gpa: 4.21,
      slots: [
        // 2시간 수업
        { day: '월', time: '10:00', subject: '재무관리', room: '경-201', credits: 3, type: 'major' },
        { day: '월', time: '11:00', subject: '재무관리', room: '경-201', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '재무관리', room: '경-201', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '재무관리', room: '경-201', credits: 3, type: 'major' },
        { day: '월', time: '15:00', subject: '비즈니스데이터분석', room: '경-305', credits: 3, type: 'major' },
        { day: '월', time: '16:00', subject: '비즈니스데이터분석', room: '경-305', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '화', time: '10:00', subject: '서비스마케팅', room: '경-204', credits: 3, type: 'major' },
        { day: '화', time: '11:00', subject: '서비스마케팅', room: '경-204', credits: 3, type: 'major' },
        { day: '화', time: '13:00', subject: '서비스마케팅', room: '경-204', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '서비스마케팅', room: '경-204', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '수', time: '10:00', subject: '글로벌경영전략', room: '경-402', credits: 3, type: 'major' },
        { day: '수', time: '11:00', subject: '글로벌경영전략', room: '경-402', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: '기업법규', room: '경-102', credits: 2, type: 'general' },
        { day: '수', time: '14:00', subject: '기업법규', room: '경-102', credits: 2, type: 'general' },
        // 2시간 수업
        { day: '목', time: '10:00', subject: 'HR Analytics', room: '경-308', credits: 3, type: 'major' },
        { day: '목', time: '11:00', subject: 'HR Analytics', room: '경-308', credits: 3, type: 'major' },
        { day: '목', time: '13:00', subject: '프레젠테이션실습', room: '경-104', credits: 2, type: 'general' },
        { day: '목', time: '14:00', subject: '프레젠테이션실습', room: '경-104', credits: 2, type: 'general' },
      ],
    },
    {
      id: 5,
      name: '최00',
      studentId: '20230089',
      department: '경영학과',
      year: '2학년',
      semester: '2학기',
      academicYear: '2024',
      gpa: 3.92,
      slots: [
        // 2시간 수업
        { day: '월', time: '10:00', subject: '경영정보시스템', room: '경-203', credits: 3, type: 'major' },
        { day: '월', time: '11:00', subject: '경영정보시스템', room: '경-203', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '회계원리', room: '경-101', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '회계원리', room: '경-101', credits: 3, type: 'major' },
        { day: '월', time: '15:00', subject: '회계원리', room: '경-101', credits: 3, type: 'major' },
        { day: '월', time: '16:00', subject: '회계원리', room: '경-101', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '화', time: '10:00', subject: '고객경험디자인', room: '경-205', credits: 3, type: 'major' },
        { day: '화', time: '11:00', subject: '고객경험디자인', room: '경-205', credits: 3, type: 'major' },
        { day: '화', time: '13:00', subject: '고객경험디자인', room: '경-205', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '고객경험디자인', room: '경-205', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '수', time: '10:00', subject: '조직행동론', room: '경-207', credits: 3, type: 'major' },
        { day: '수', time: '11:00', subject: '조직행동론', room: '경-207', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: '스토리텔링워크숍', room: '본-301', credits: 2, type: 'general' },
        { day: '수', time: '14:00', subject: '스토리텔링워크숍', room: '본-301', credits: 2, type: 'general' },
        // 2시간 수업
        { day: '목', time: '10:00', subject: '데이터시각화', room: '경-210', credits: 3, type: 'major' },
        { day: '목', time: '11:00', subject: '데이터시각화', room: '경-210', credits: 3, type: 'major' },
        { day: '목', time: '13:00', subject: '비즈니스영어', room: '어-201', credits: 2, type: 'general' },
        { day: '목', time: '14:00', subject: '비즈니스영어', room: '어-201', credits: 2, type: 'general' },
      ],
    },
    {
      id: 6,
      name: '강00',
      studentId: '20200045',
      department: '미디어디자인학과',
      year: '4학년',
      semester: '2학기',
      academicYear: '2023',
      gpa: 4.05,
      slots: [
        // 2시간 수업
        { day: '월', time: '10:00', subject: '모션그래픽스', room: '미-201', credits: 3, type: 'major' },
        { day: '월', time: '11:00', subject: '모션그래픽스', room: '미-201', credits: 3, type: 'major' },
        { day: '월', time: '13:00', subject: '모션그래픽스', room: '미-201', credits: 3, type: 'major' },
        { day: '월', time: '14:00', subject: '모션그래픽스', room: '미-201', credits: 3, type: 'major' },
        { day: '월', time: '15:00', subject: 'UX프로토타이핑', room: '미-304', credits: 3, type: 'major' },
        { day: '월', time: '16:00', subject: 'UX프로토타이핑', room: '미-304', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '화', time: '10:00', subject: '3D애니메이션', room: '미-205', credits: 3, type: 'major' },
        { day: '화', time: '11:00', subject: '3D애니메이션', room: '미-205', credits: 3, type: 'major' },
        { day: '화', time: '13:00', subject: '3D애니메이션', room: '미-205', credits: 3, type: 'major' },
        { day: '화', time: '14:00', subject: '3D애니메이션', room: '미-205', credits: 3, type: 'major' },
        // 2시간 수업
        { day: '수', time: '10:00', subject: '인터랙티브미디어', room: '미-207', credits: 3, type: 'major' },
        { day: '수', time: '11:00', subject: '인터랙티브미디어', room: '미-207', credits: 3, type: 'major' },
        { day: '수', time: '13:00', subject: '문화콘텐츠기획', room: '미-101', credits: 2, type: 'general' },
        { day: '수', time: '14:00', subject: '문화콘텐츠기획', room: '미-101', credits: 2, type: 'general' },
        // 2시간 수업
        { day: '목', time: '10:00', subject: '디자인세미나', room: '미-209', credits: 2, type: 'major' },
        { day: '목', time: '11:00', subject: '디자인세미나', room: '미-209', credits: 2, type: 'major' },
        { day: '목', time: '13:00', subject: '창의글쓰기', room: '본-210', credits: 2, type: 'general' },
        { day: '목', time: '14:00', subject: '창의글쓰기', room: '본-210', credits: 2, type: 'general' },
      ],
    },
  ];

  // 필터링된 시간표
  const filteredTimetables = seniorTimetables.filter((timetable) => {
    const departmentMatch = selectedDepartment === 'all' || timetable.department === selectedDepartment;
    const gradeMatch = selectedGrade === 'all' || timetable.year === selectedGrade;
    return departmentMatch && gradeMatch;
  });

  const handleUseTimetable = (name: string) => {
    toast.success(`${formatName(name)}의 시간표를 참고용으로 저장했습니다.`);
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
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px] bg-black/40 border-white/20 text-white focus:border-purple-500/50">
                  <SelectValue placeholder="전체 학과" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20 text-white">
                  <SelectItem value="all">전체 학과</SelectItem>
                  <SelectItem value="컴퓨터공학과">컴퓨터공학과</SelectItem>
                  <SelectItem value="소프트웨어학과">소프트웨어학과</SelectItem>
                  <SelectItem value="전자공학과">전자공학과</SelectItem>
                  <SelectItem value="전자컴퓨터공학과">전자컴퓨터공학과</SelectItem>
                  <SelectItem value="경영학과">경영학과</SelectItem>
                  <SelectItem value="경제학과">경제학과</SelectItem>
                  <SelectItem value="국어국문학과">국어국문학과</SelectItem>
                  <SelectItem value="영어영문학과">영어영문학과</SelectItem>
                  <SelectItem value="미디어디자인학과">미디어디자인학과</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[140px] bg-black/40 border-white/20 text-white focus:border-purple-500/50">
                  <SelectValue placeholder="전체 학년" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20 text-white">
                  <SelectItem value="all">전체 학년</SelectItem>
                  <SelectItem value="1학년">1학년</SelectItem>
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
                        <h3 className="text-white mb-1">{formatName(timetable.name)}</h3>
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
                    <TimetableGrid timetable={mapSlotsWithPeriod(timetable.slots)} />
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