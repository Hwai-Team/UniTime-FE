import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

interface AddPreviousTimetableDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (year: string, semester: string) => void;
}

export default function AddPreviousTimetableDialog({ open, onClose, onAdd }: AddPreviousTimetableDialogProps) {
  const [year, setYear] = useState('24');
  const [semester, setSemester] = useState('1');

  const handleAdd = () => {
    onAdd(year, semester);
    onClose();
  };

  // Generate years (현재 년도 기준 ±5년)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const y = currentYear - 5 + i;
    return String(y).slice(2); // "24", "25" 형식
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">이전 학기 시간표 추가</DialogTitle>
          <DialogDescription className="text-white/60">
            학년도와 학기를 선택하여 새로운 시간표를 추가하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Year Selection */}
          <div className="space-y-2">
            <Label className="text-white/80">학년도</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="bg-black/40 border-white/20 text-white focus:border-purple-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/20 text-white">
                {years.map(y => (
                  <SelectItem key={y} value={y}>
                    20{y}학년도
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Selection */}
          <div className="space-y-2">
            <Label className="text-white/80">학기</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="bg-black/40 border-white/20 text-white focus:border-purple-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/20 text-white">
                <SelectItem value="1">1학기</SelectItem>
                <SelectItem value="2">2학기</SelectItem>
                <SelectItem value="summer">여름학기</SelectItem>
                <SelectItem value="winter">겨울학기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Text */}
          <div className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-white/80">
              선택한 학년도/학기의 빈 시간표가 생성됩니다.
            </p>
            <p className="text-xs text-white/60 mt-2">
              생성 후 "수정" 버튼을 눌러 과목을 추가할 수 있습니다.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10"
            >
              취소
            </Button>
            <Button
              onClick={handleAdd}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            >
              추가
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
