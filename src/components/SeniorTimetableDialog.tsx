import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Card } from './ui/card';
import { Button } from './ui/button';
import TimetableGrid from './TimetableGrid';

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
  department: string;
  year: string;
  semester: string;
  gpa: number;
  slots: TimeSlot[];
}

interface SeniorTimetableDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyTimetable: (slots: TimeSlot[]) => void;
}

export default function SeniorTimetableDialog({ open, onClose, onApplyTimetable }: SeniorTimetableDialogProps) {
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

  const seniorTimetables: SeniorTimetable[] = [
    {
      id: 1,
      name: '김00',
      department: '컴퓨터공학과',
      year: '3학년',
      semester: '2024-1',
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
      department: '컴퓨터공학과',
      year: '4학년',
      semester: '2024-1',
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
      department: '컴퓨터공학과',
      year: '2학년',
      semester: '2024-2',
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
      department: '경영학과',
      year: '3학년',
      semester: '2024-1',
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
      department: '경영학과',
      year: '2학년',
      semester: '2024-2',
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
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[96vw] w-[96vw] max-h-[92vh] bg-black/95 border-white/20 p-0 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <DialogTitle className="text-white text-xl mb-2">선배들의 시간표</DialogTitle>
          <DialogDescription className="text-white/50 text-sm">
            시간표를 클릭하여 자신의 시간표로 가져올 수 있습니다
          </DialogDescription>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(92vh-100px)] p-6">
          <div className="grid grid-cols-3 gap-6">
            {seniorTimetables.map((timetable) => (
              <Card 
                key={timetable.id} 
                className="bg-black/60 backdrop-blur-md border-white/15 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white mb-1">{formatName(timetable.name)}</h3>
                      <p className="text-white/50 text-sm">{timetable.year} · {timetable.semester}학기</p>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 text-sm">평균 학점</div>
                      <div className="text-white">{timetable.gpa}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => onApplyTimetable(mapSlotsWithPeriod(timetable.slots))}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-9 text-sm"
                  >
                    이 시간표 사용하기
                  </Button>
                </div>

                {/* Timetable */}
                <div className="flex-1 p-4">
                  <div className="h-[calc(92vh-320px)] min-h-[400px] rounded-lg overflow-hidden bg-black/40 border border-white/10">
                    <TimetableGrid timetable={mapSlotsWithPeriod(timetable.slots)} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}