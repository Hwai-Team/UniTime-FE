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
  type?: 'major' | 'general';
}

const DAYS = ['월', '화', '수', '목', '금'];

// 전공 과목 색상 (보라색 계열)
const MAJOR_COLORS = [
  '#9D8FE8', // purple
  '#B89FE8', // lavender
  '#8B7FD6', // medium purple
  '#A896E8', // light purple
  '#7A6FCC', // deep purple
  '#C5B3FF', // pale purple
];

// 교양 과목 색상 (파란색 계열)
const GENERAL_COLORS = [
  '#7FCCC0', // teal
  '#6BC5B8', // cyan
  '#5AB9AC', // turquoise
  '#8FD8CC', // light teal
  '#4DADA0', // deep teal
  '#A3E8DD', // pale cyan
];

export default function TimetableGrid({ timetable }: TimetableGridProps) {
  // Parse time from "09:00" format to hour number
  const parseTimeToHour = (timeStr: string): number => {
    const hour = parseInt(timeStr.split(':')[0]);
    return hour;
  };

  // Get color for subject based on type
  const subjectColorMap = new Map<string, string>();
  const getColorForSubject = (subject: string, type?: 'major' | 'general'): string => {
    if (!subjectColorMap.has(subject)) {
      const isMajor = type === 'major';
      const colors = isMajor ? MAJOR_COLORS : GENERAL_COLORS;
      const colorIndex = subjectColorMap.size % colors.length;
      subjectColorMap.set(subject, colors[colorIndex]);
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
          type: currentSlot.type,
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
                      style={{ backgroundColor: getColorForSubject(mergedSlot.subject, mergedSlot.type) }}
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