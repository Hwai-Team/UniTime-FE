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
  const seniorTimetables: SeniorTimetable[] = [
    {
      id: 1,
      name: '김민수',
      department: '컴퓨터공학과',
      year: '3학년',
      semester: '2024-1',
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
      department: '컴퓨터공학과',
      year: '4학년',
      semester: '2024-1',
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
      department: '컴퓨터공학과',
      year: '2학년',
      semester: '2024-2',
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
                      <h3 className="text-white mb-1">{timetable.name}</h3>
                      <p className="text-white/50 text-sm">{timetable.year} · {timetable.semester}학기</p>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 text-sm">평균 학점</div>
                      <div className="text-white">{timetable.gpa}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => onApplyTimetable(timetable.slots)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-9 text-sm"
                  >
                    이 시간표 사용하기
                  </Button>
                </div>

                {/* Timetable */}
                <div className="flex-1 p-4">
                  <div className="h-[calc(92vh-320px)] min-h-[400px] rounded-lg overflow-hidden bg-black/40 border border-white/10">
                    <TimetableGrid timetable={timetable.slots} />
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