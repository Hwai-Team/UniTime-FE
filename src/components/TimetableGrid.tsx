import { motion } from 'motion/react';

interface TimeSlot {
  day: string;
  time: string;
  subject: string;
  room: string;
  credits?: number;
  type?: 'major' | 'general';
  courseCode?: string;
  period?: string; // "1" | "2" | ... | "26"
}

interface TimetableGridProps {
  timetable: TimeSlot[];
}

interface MergedSlot {
  day: string;
  startHour: number; // 9.0 ~ 18.0 사이 소수
  endHour: number;
  subject: string;
  room: string;
  courseCode: string;
  type?: 'major' | 'general';
}

// 요일
const DAYS = ['월', '화', '수', '목', '금'];

// 시간 축 (왼쪽 라벨 10시~18시)
const START_HOUR = 10;
const END_HOUR = 19; // 18~19가 마지막 구간
const HOUR_SPAN = END_HOUR - START_HOUR; // 9칸

// 교시 순서
const PERIOD_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 21, 22, 23, 24, 25, 26];

// 교시별 실제 시간(소수 시간 단위) - +1 시간 적용
const PERIOD_TIME: Record<
  number,
  {
    start: number; // 예: 10.0
    end: number;   // 예: 10.833 (10:50)
  }
> = {
  1: { start: 10.0, end: 10.0 + 50 / 60 },   // 10:00 ~ 10:50
  2: { start: 11.0, end: 11.0 + 50 / 60 }, // 11:00 ~ 11:50
  3: { start: 12.0, end: 12.0 + 50 / 60 }, // 12:00 ~ 12:50
  4: { start: 13.0, end: 13.0 + 50 / 60 }, // 13:00 ~ 13:50
  5: { start: 14.0, end: 14.0 + 50 / 60 }, // 14:00 ~ 14:50
  6: { start: 15.0, end: 15.0 + 50 / 60 }, // 15:00 ~ 15:50
  7: { start: 16.0, end: 16.0 + 50 / 60 }, // 16:00 ~ 16:50
  8: { start: 17.0, end: 17.0 + 50 / 60 }, // 17:00 ~ 17:50
  9: { start: 18.0, end: 18.0 + 50 / 60 }, // 18:00 ~ 18:50

  // 75분 수업
  21: { start: 10.0, end: 11.25 },  // 10:00 ~ 11:15
  22: { start: 11.5, end: 12.75 }, // 11:30 ~ 12:45
  23: { start: 13.0, end: 14.25 }, // 13:00 ~ 14:15
  24: { start: 14.5, end: 15.75 }, // 14:30 ~ 15:45
  25: { start: 16.0, end: 17.25 }, // 16:00 ~ 17:15
  26: { start: 17.5, end: 18.75 }, // 17:30 ~ 18:45
};

// 전공/교양 구분 없이 사용할 고대비 팔레트
const SUBJECT_COLORS = [
  '#EF476F', // 진한 핑크
  '#F78C6B', // 살몬 오렌지
  '#FFD166', // 따뜻한 옐로우
  '#06D6A0', // 선명한 민트
  '#1FAB89', // 청록
  '#118AB2', // 대비 있는 블루
  '#5E60CE', // 퍼플
  '#8338EC', // 보라
  '#FF5D8F', // 비비드 핑크
  '#FF4C29', // 코럴 레드
  '#2EC4B6', // 그린 블루
  '#1B998B', // 다크 민트
];

const LABEL_COL_WIDTH = 70; // 왼쪽 시간 라벨 넓이(px)
const HEADER_HEIGHT = 40;   // 요일 헤더 높이(px)

export default function TimetableGrid({ timetable }: TimetableGridProps) {
  // period → index
  const periodIndexMap = new Map<number, number>();
  PERIOD_ORDER.forEach((p, idx) => periodIndexMap.set(p, idx));

  // 과목별 색상
  const subjectColorMap = new Map<string, string>();
  const getColorForSubject = (subject: string) => {
    if (!subjectColorMap.has(subject)) {
      const colorIndex = subjectColorMap.size % SUBJECT_COLORS.length;
      subjectColorMap.set(subject, SUBJECT_COLORS[colorIndex]);
    }
    return subjectColorMap.get(subject)!;
  };

  // 같은 요일 + 같은 과목 + 연속 교시 병합
  const mergeConsecutiveSlots = (): MergedSlot[] => {
    const merged: MergedSlot[] = [];

    DAYS.forEach((day) => {
      const daySlots = timetable
        .filter((slot) => slot.day === day && slot.period != null)
        .map((slot) => {
          const pNum = Number(slot.period);
          const idx = periodIndexMap.get(pNum);
          if (idx === undefined || !PERIOD_TIME[pNum]) return null;
          return { ...slot, periodNum: pNum, index: idx };
        })
        .filter(
          (v): v is TimeSlot & { periodNum: number; index: number } => v !== null,
        )
        .sort((a, b) => a.index - b.index);

      let i = 0;
      while (i < daySlots.length) {
        const curr = daySlots[i];
        let endIndex = curr.index;
        let lastPeriodNum = curr.periodNum;
        let j = i + 1;

        while (
          j < daySlots.length &&
          daySlots[j].courseCode === curr.courseCode &&
          daySlots[j].subject === curr.subject &&
          daySlots[j].index === endIndex + 1
        ) {
          endIndex = daySlots[j].index;
          lastPeriodNum = daySlots[j].periodNum;
          j++;
        }

        const firstTime = PERIOD_TIME[curr.periodNum];
        const lastTime = PERIOD_TIME[lastPeriodNum];

        merged.push({
          day,
          startHour: firstTime.start,
          endHour: lastTime.end,
          subject: curr.subject,
          room: curr.room,
          courseCode: curr.courseCode || '',
          type: curr.type,
        });

        i = j;
      }
    });

    return merged;
  };

  const mergedSlots = mergeConsecutiveSlots();

  // 10~18시 라벨
  const hourRows = Array.from({ length: HOUR_SPAN }, (_, i) => START_HOUR + i);

  const getHourLabel = (hour: number): string => {
    if (hour === 12) return '12';
    if (hour > 12) return String(hour - 12); // 13→1, 14→2 ...
    return String(hour);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full max-h-full border border-white/20 rounded-lg overflow-hidden bg-black/40">
        {/* 배경 그리드 (시간/요일 라인만) */}
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(5, 1fr)`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${HOUR_SPAN}, minmax(50px, 1fr))`,
          }}
        >
          {/* 헤더: 왼쪽 빈칸 + 요일 */}
          <div className="bg-black/60 border-b border-r border-white/20" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-black/60 border-b border-r last:border-r-0 border-white/20 text-center text-white/80 flex items-center justify-center text-sm"
            >
              {day}
            </div>
          ))}

          {/* 시간 라벨 + 빈 칸(그리드 칸) */}
          {hourRows.map((hour) => (
            <div key={`row-${hour}`} className="contents">
              {/* 왼쪽 시간 라벨 */}
              <div className="bg-black/40 border-b border-r border-white/20 text-center text-xs flex items-center justify-center">
                <span className="text-white/70">{getHourLabel(hour)}</span>
              </div>

              {/* 요일별 셀 (배경선만) */}
              {DAYS.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className="border-b border-r last:border-r-0 border-white/20"
                />
              ))}
            </div>
          ))}
        </div>

        {/* 강의 블록 overlay (실제 위치는 period 기준으로 % 계산) */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: LABEL_COL_WIDTH,
            right: 0,
            top: HEADER_HEIGHT,
            bottom: 0,
          }}
        >
          {mergedSlots.map((slot, idx) => {
            const dayIndex = DAYS.indexOf(slot.day);
            if (dayIndex === -1) return null;

            const colWidthPercent = 100 / DAYS.length;
            const leftPercent = dayIndex * colWidthPercent;
            const widthPercent = colWidthPercent;

            const topPercent =
              ((slot.startHour - START_HOUR) / HOUR_SPAN) * 100;
            const heightPercent =
              ((slot.endHour - slot.startHour) / HOUR_SPAN) * 100;

            // ✅ 모든 블록에 동일한 폰트/패딩 적용
            const subjectFontSize = 'text-[11px]';
            const roomFontSize = 'text-[10px]';
            const padding = 'p-1.5';
            const lineClamp = 'line-clamp-2';

            return (
              <div
                key={`${slot.day}-${slot.courseCode}-${idx}`}
                className="absolute px-[2px]"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className={`pointer-events-auto absolute inset-[1px] ${padding} flex flex-col justify-center items-center text-center overflow-hidden rounded-sm`}
                  style={{
                    backgroundColor: getColorForSubject(slot.subject),
                  }}
                >
                  <div
                    className={`text-white ${subjectFontSize} leading-tight px-0.5 ${lineClamp} w-full break-words overflow-hidden`}
                  >
                    {slot.subject}
                  </div>
                  {slot.room && (
                    <div
                      className={`text-white/90 ${roomFontSize} mt-0.5 line-clamp-1 w-full break-words overflow-hidden`}
                    >
                      {slot.room}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
