// 시간표 유틸리티 함수

export interface TimeSlot {
  day: string;
  time: string;
  subject: string;
  room: string;
  credits?: number;
  type?: 'major' | 'general';
  courseCode?: string;
  period?: string;
}

export interface ApiCourseItem {
  id: number;
  courseId: number;
  credit: number;
  professor: string;
  courseName: string;
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  startPeriod: number;
  endPeriod: number;
  room: string;
  category: string;
  recommendedGrade: number | null;
}

// 교양 교시 (1-9교시) - 각 50분
const GENERAL_PERIODS: { [key: number]: { time: string; range: string } } = {
  1: { time: '09:00', range: '09:00~09:50' },
  2: { time: '10:00', range: '10:00~10:50' },
  3: { time: '11:00', range: '11:00~11:50' },
  4: { time: '12:00', range: '12:00~12:50' },
  5: { time: '13:00', range: '13:00~13:50' },
  6: { time: '14:00', range: '14:00~14:50' },
  7: { time: '15:00', range: '15:00~15:50' },
  8: { time: '16:00', range: '16:00~16:50' },
  9: { time: '17:00', range: '17:00~17:50' },
};

// 전공 교시 (21-26교시) - 75분이지만, 그리드는 1시간 단위를 사용하므로 시작 시각을 정시로 정규화
// 목업과 동일 규칙: 21→09:00, 22→10:00, 23→11:00, 24→13:00, 25→15:00, 26→16:00
const MAJOR_PERIODS: { [key: number]: { time: string; range: string } } = {
  21: { time: '09:00', range: '09:00~10:15' },
  22: { time: '10:00', range: '10:30~11:45' },
  23: { time: '11:00', range: '12:00~13:15' },
  24: { time: '13:00', range: '13:30~14:45' },
  25: { time: '15:00', range: '15:00~16:15' },
  26: { time: '16:00', range: '16:30~17:45' },
};

// 요일 매핑 (영어 -> 한글)
const DAY_MAP: { [key: string]: string } = {
  'MON': '월',
  'TUE': '화',
  'WED': '수',
  'THU': '목',
  'FRI': '금',
};

// 카테고리 -> 타입 변환
export function getCourseType(category: string): 'major' | 'general' {
  // 전필(전공필수), 전선(전공선택), 전심(전공심화) 등은 major
  // 교필(교양필수), 교선(교양선택) 등은 general
  const majorCategories = ['전필', '전선', '전심', '전기', '전공'];
  const generalCategories = ['교필', '교선', '교양', '기교'];

  const normalizedCategory = category?.trim() || '';
  const firstChar = normalizedCategory[0];

  if (firstChar === '전') {
    return 'major';
  }

  if (firstChar === '교') {
    return 'general';
  }
  
  if (majorCategories.some(cat => normalizedCategory.includes(cat))) {
    return 'major';
  }
  
  if (generalCategories.some(cat => normalizedCategory.includes(cat))) {
    return 'general';
  }
  
  // 기본값: 교시 번호로 판단
  return 'general';
}

// 교시 번호로 타입 판단
export function getPeriodType(period: number): 'major' | 'general' {
  return period >= 21 ? 'major' : 'general';
}

// API 응답을 TimeSlot 배열로 변환
export function convertApiItemsToTimeSlots(items: ApiCourseItem[]): TimeSlot[] {
  const slots: TimeSlot[] = [];

  items.forEach((item) => {
    // 카테고리로 타입 결정
    const courseType = getCourseType(item.category);
    
    // 교시 범위에 따라 적절한 교시 테이블 선택
    const periodType = getPeriodType(item.startPeriod);
    const periods = periodType === 'major' ? MAJOR_PERIODS : GENERAL_PERIODS;

    // 요일 변환
    const day = DAY_MAP[item.dayOfWeek] || item.dayOfWeek;

    // startPeriod부터 endPeriod까지 각 교시별로 슬롯 생성
    for (let period = item.startPeriod; period <= item.endPeriod; period++) {
      const periodInfo = periods[period];
      
      if (periodInfo) {
        slots.push({
          day,
          time: periodInfo.time,
          period: String(period),
          subject: item.courseName,
          courseCode: String(item.courseId),
          room: item.room,
          credits: item.credit,
          type: courseType,
        });
      } else {
        // 교시 정보가 없는 경우 (예: 1-9교시 범위에 21교시가 들어온 경우)
        console.warn(`Period ${period} not found in ${periodType} periods for course ${item.courseName}`);
      }
    }
  });

  return slots;
}

// 시간표 제목 생성
export function generateTimetableTitle(year: number, semester: number | string): string {
  let semesterText = '';
  
  if (semester === 1) {
    semesterText = '1학기';
  } else if (semester === 2) {
    semesterText = '2학기';
  } else if (semester === 'summer' || semester === 3) {
    semesterText = '여름학기';
  } else if (semester === 'winter' || semester === 4) {
    semesterText = '겨울학기';
  }
  
  return `${year}년도 ${semesterText}`;
}

// 총 학점 계산 (중복 제거)
export function calculateCredits(slots: TimeSlot[]): {
  majorCredits: number;
  generalCredits: number;
  totalCredits: number;
} {
  // 과목별로 그룹화하여 중복 제거
  const uniqueCourses = new Map<string, TimeSlot>();
  
  slots.forEach(slot => {
    const key = `${slot.courseCode}-${slot.subject}`;
    if (!uniqueCourses.has(key)) {
      uniqueCourses.set(key, slot);
    }
  });

  let majorCredits = 0;
  let generalCredits = 0;
  
  uniqueCourses.forEach(slot => {
    if (slot.type === 'major') {
      majorCredits += slot.credits || 0;
    } else {
      generalCredits += slot.credits || 0;
    }
  });
  
  return {
    majorCredits,
    generalCredits,
    totalCredits: majorCredits + generalCredits,
  };
}

// 교시 범위를 문자열로 포맷팅 (예: "월 21~22교시")
export function formatPeriodRange(slots: TimeSlot[]): string {
  if (slots.length === 0) return '';
  
  // 같은 과목의 슬롯들을 요일별로 그룹화
  const dayGroups = new Map<string, number[]>();
  
  slots.forEach(slot => {
    if (!dayGroups.has(slot.day)) {
      dayGroups.set(slot.day, []);
    }
    if (slot.period) {
      dayGroups.get(slot.day)!.push(parseInt(slot.period));
    }
  });
  
  // 각 요일별로 교시 범위 생성
  const parts: string[] = [];
  dayGroups.forEach((periods, day) => {
    periods.sort((a, b) => a - b);
    const start = periods[0];
    const end = periods[periods.length - 1];
    
    if (start === end) {
      parts.push(`${day} ${start}교시`);
    } else {
      parts.push(`${day} ${start}~${end}교시`);
    }
  });
  
  return parts.join(', ');
}
