import { Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import TimetableGrid from './TimetableGrid';
import type { TimeSlot } from '../lib/timetableUtils';

interface TimetablePanelProps {
  timetable: TimeSlot[];
  onGenerateTimetable: () => void;
  onModifyTimetable: () => void;
  isGenerating?: boolean;
  hasEnoughMessages: boolean;
}

export default function TimetablePanel({ 
  timetable, 
  onGenerateTimetable, 
  onModifyTimetable,
  isGenerating = false,
  hasEnoughMessages 
}: TimetablePanelProps) {
  // Calculate credit statistics
  const calculateCredits = () => {
    const majorCredits = timetable
      .filter(slot => slot.type === 'major')
      .reduce((sum, slot) => sum + (slot.credits || 0), 0);
    
    const generalCredits = timetable
      .filter(slot => slot.type === 'general')
      .reduce((sum, slot) => sum + (slot.credits || 0), 0);
    
    const totalCredits = majorCredits + generalCredits;
    
    return { majorCredits, generalCredits, totalCredits };
  };

  const { majorCredits, generalCredits, totalCredits } = calculateCredits();

  return (
    <div className="flex-1 bg-black/30 backdrop-blur-sm p-4 overflow-hidden flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-white text-sm">생성된 시간표</h3>
        {timetable.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-purple-400">전공 {majorCredits}학점</span>
            <span className="text-blue-400">교양 {generalCredits}학점</span>
            <span className="text-white">총 {totalCredits}학점</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* 상단 버튼 영역 */}
        <div className="mb-3 flex-shrink-0">
          {timetable.length > 0 ? (
            <Card className="p-3 bg-black/40 backdrop-blur-md border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="size-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs">왼쪽 채팅에서 수정 요청 후</p>
                    <p className="text-white/60 text-[10px]">아래 버튼을 눌러 업데이트하세요</p>
                  </div>
                </div>
                <Button
                  onClick={onModifyTimetable}
                  disabled={isGenerating}
                  size="sm"
                  className="gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8 flex-shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      수정 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-3.5" />
                      대화 기반 수정
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4 bg-black/40 backdrop-blur-md border-white/10 border-dashed">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="size-5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white mb-0.5 text-sm">시간표를 생성해보세요</h3>
                    <p className="text-white/60 text-xs">
                      AI와의 대화를 바탕으로 맞춤 시간표를 생성합니다
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onGenerateTimetable}
                  disabled={!hasEnoughMessages || isGenerating}
                  size="sm"
                  className="gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed px-4 text-xs flex-shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    '시간표 생성'
                  )}
                </Button>
              </div>
              {!hasEnoughMessages && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-white/40 flex items-center gap-2">
                    <span>💡</span>
                    <span>먼저 AI와 대화를 시작해주세요 (학년, 전공, 선호 시간대 등)</span>
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* 시간표 그리드 */}
        {isGenerating ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Card className="max-w-md w-full p-8 bg-black/40 backdrop-blur-md border-white/10">
              <div className="text-center space-y-4">
                <div className="mx-auto size-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="size-8 text-purple-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-sm">
                    {timetable.length > 0 ? '시간표를 수정하고 있습니다' : '시간표를 생성하고 있습니다'}
                  </h3>
                  <p className="text-white/60 text-xs">
                    대화 내용을 분석하여<br />
                    {timetable.length > 0 ? '시간표를 업데이트하고 있습니다...' : '최적의 시간표를 만들고 있습니다...'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="size-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                  <div className="size-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="size-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden min-h-0">
            <TimetableGrid timetable={timetable} />
          </div>
        )}
      </div>
    </div>
  );
}