import { RotateCcw, Users } from 'lucide-react';
import { Button } from './ui/button';

interface ChatSidebarProps {
  onResetChat: () => void;
  onShowSeniorTimetables: () => void;
}

export default function ChatSidebar({ onResetChat, onShowSeniorTimetables }: ChatSidebarProps) {
  return (
    <div className="w-64 flex flex-col bg-black/30 backdrop-blur-sm border-r border-white/10">
      <div className="p-4 space-y-3">
        <Button
          onClick={onResetChat}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/15"
        >
          <RotateCcw className="size-4 mr-2" />
          채팅 초기화
        </Button>
        
        <Button
          onClick={onShowSeniorTimetables}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.5)]"
        >
          <Users className="size-4 mr-2" />
          선배들의 시간표 참고하기
        </Button>
      </div>
    </div>
  );
}
