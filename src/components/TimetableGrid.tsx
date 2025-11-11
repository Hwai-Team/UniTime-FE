import { motion } from 'motion/react';

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

interface TimetableGridProps {
  timetable: TimeSlot[];
}

interface MergedSlot {
  day: string;
  startHour: number;
  endHour: number;
  subject: string;
  room: string;
  courseCode: string;
}

const DAYS = ['월', '화', '수', '목', '금'];

const SUBJECT_COLORS = [
  '#FF6B8A', // coral pink
  '#A3D977', // lime green
  '#E8B55D', // golden yellow
  '#7FCCC0', // teal
  '#8FA3E8', // blue
  '#E89B74', // orange
  '#9D8FE8', // purple
  '#6BC5B8', // cyan
  '#FFB366', // light orange
  '#B89FE8', // lavender
];

export default function TimetableGrid({ timetable }: TimetableGridProps) {
  if (timetable.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <div className="text-center">
          <svg className="size-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">아직 생성된 시간표가 없습니다</p>
          <p className="text-xs mt-2">채팅을 시작하여 시간표를 생성하세요</p>
        </div>
      </div>
    );
  }

  // Parse time from "09:00" format to hour number
  const parseTimeToHour = (timeStr: string): number => {
    const hour = parseInt(timeStr.split(':')[0]);
    return hour;
  };

  // Get color for subject (consistent color per subject)
  const subjectColorMap = new Map<string, string>();
  const getColorForSubject = (subject: string): string => {
    if (!subjectColorMap.has(subject)) {
      const colorIndex = subjectColorMap.size % SUBJECT_COLORS.length;
      subjectColorMap.set(subject, SUBJECT_COLORS[colorIndex]);
    }
    return subjectColorMap.get(subject)!;
  };

  // 고정된 시간 범위 사용 (모든 시간표 크기 통일)
  const minHour = 9;  // 9시부터
  const maxHour = 19; // 7시(19시)까지

  // 연속된 같은 과목 병합
  const mergeConsecutiveSlots = (): MergedSlot[] => {
    const merged: MergedSlot[] = [];
    
    DAYS.forEach(day => {
      // 해당 요일의 모든 슬롯을 시간순으로 정렬
      const daySlots = timetable
        .filter(slot => slot.day === day)
        .map(slot => ({
          ...slot,
          hour: parseTimeToHour(slot.time),
        }))
        .sort((a, b) => a.hour - b.hour);

      let i = 0;
      while (i < daySlots.length) {
        const currentSlot = daySlots[i];
        let endHour = currentSlot.hour;
        
        // 같은 과목이 연속되는지 확인
        let j = i + 1;
        while (
          j < daySlots.length &&
          daySlots[j].courseCode === currentSlot.courseCode &&
          daySlots[j].subject === currentSlot.subject &&
          daySlots[j].hour === endHour + 1
        ) {
          endHour = daySlots[j].hour;
          j++;
        }

        merged.push({
          day,
          startHour: currentSlot.hour,
          endHour: endHour + 1, // endHour는 exclusive
          subject: currentSlot.subject,
          room: currentSlot.room,
          courseCode: currentSlot.courseCode || '',
        });

        i = j;
      }
    });

    return merged;
  };

  const mergedSlots = mergeConsecutiveSlots();

  // 시간 라벨 생성
  const timeSlots: number[] = [];
  for (let hour = minHour; hour < maxHour; hour++) {
    timeSlots.push(hour);
  }

  const getTimeLabel = (hour: number): string => {
    if (hour === 12) return '12';
    if (hour > 12) return String(hour - 12);
    return String(hour);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full max-h-full grid auto-rows-fr gap-0 border border-white/20 rounded-lg overflow-hidden bg-black/40" style={{ gridTemplateColumns: `50px repeat(5, 1fr)` }}>
        {/* Header Row - Days */}
        <div className="bg-black/60 border-b border-r border-white/20 flex items-center justify-center min-h-[40px]"></div>
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-black/60 border-b border-r last:border-r-0 border-white/20 text-center text-white/80 flex items-center justify-center text-sm min-h-[40px]"
          >
            {day}
          </div>
        ))}

        {/* Time Rows */}
        {timeSlots.map((hour, timeIndex) => (
          <div key={`time-row-${hour}`} className="contents">
            {/* Time Label */}
            <div className="bg-black/40 border-b border-r border-white/20 text-center text-white/60 text-xs flex items-center justify-center min-h-[50px]">
              {getTimeLabel(hour)}
            </div>

            {/* Day Cells */}
            {DAYS.map((day, dayIndex) => {
              // 이 셀이 병합된 슬롯의 시작점인지 확인
              const mergedSlot = mergedSlots.find(
                slot => slot.day === day && slot.startHour === hour
              );

              // 이 셀이 병합된 슬롯의 중간/끝 부분인지 확인
              const isPartOfMergedSlot = mergedSlots.some(
                slot => slot.day === day && slot.startHour < hour && slot.endHour > hour
              );

              return (
                <div
                  key={`${day}-${hour}`}
                  className="border-b border-r last:border-r-0 border-white/20 relative group hover:bg-white/5 transition-colors min-h-[50px] overflow-hidden"
                  style={
                    mergedSlot
                      ? {
                          gridRowEnd: `span ${mergedSlot.endHour - mergedSlot.startHour}`,
                        }
                      : isPartOfMergedSlot
                      ? { display: 'none' }
                      : {}
                  }
                >
                  {mergedSlot && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: (timeIndex * 5 + dayIndex) * 0.02 }}
                      className="absolute inset-[1px] p-1.5 flex flex-col justify-center items-center text-center overflow-hidden rounded-sm"
                      style={{ backgroundColor: getColorForSubject(mergedSlot.subject) }}
                    >
                      <div className="text-white text-[11px] leading-tight px-0.5 line-clamp-2 w-full break-words overflow-hidden">
                        {mergedSlot.subject}
                      </div>
                      {mergedSlot.room && (
                        <div className="text-white/90 text-[10px] mt-0.5 line-clamp-1 w-full break-words overflow-hidden">
                          {mergedSlot.room}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
