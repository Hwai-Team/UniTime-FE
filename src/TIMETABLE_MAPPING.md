# 시간표 API 응답 매핑 가이드

## 📋 교시 체계

### 교양 교시 (1-9교시) - 각 50분
```
1교시: 09:00 ~ 09:50
2교시: 10:00 ~ 10:50
3교시: 11:00 ~ 11:50
4교시: 12:00 ~ 12:50
5교시: 13:00 ~ 13:50
6교시: 14:00 ~ 14:50
7교시: 15:00 ~ 15:50
8교시: 16:00 ~ 16:50
9교시: 17:00 ~ 17:50
```

### 전공 교시 (21-26교시) - 각 75분 (1시간 15분)
```
21교시: 09:00 ~ 10:15
22교시: 10:30 ~ 11:45
23교시: 12:00 ~ 13:15
24교시: 13:30 ~ 14:45
25교시: 15:00 ~ 16:15
26교시: 16:30 ~ 17:45
```

---

## 🔄 API 응답 구조

```typescript
{
  "id": 96,
  "year": 2025,
  "semester": 2,
  "title": "호날두의 2학년 컴퓨터공학과 시간표",
  "items": [
    {
      "id": 468,
      "courseId": 106,
      "credit": 3,
      "professor": "안가경",
      "courseName": "Advanced Calculus 2",
      "dayOfWeek": "THU",           // MON, TUE, WED, THU, FRI
      "startPeriod": 25,            // 시작 교시
      "endPeriod": 26,              // 종료 교시
      "room": "혜-305",
      "category": "교선",           // 전필, 전선, 전심, 교필, 교선 등
      "recommendedGrade": null
    }
  ]
}
```

---

## ⚙️ 매핑 로직

### 1. 요일 변환
```typescript
const DAY_MAP = {
  'MON': '월',
  'TUE': '화',
  'WED': '수',
  'THU': '목',
  'FRI': '금',
};
```

### 2. 카테고리 → 타입 변환
```typescript
// 전필, 전선, 전심 → 'major'
// 교필, 교선 → 'general'

function getCourseType(category: string): 'major' | 'general' {
  const majorCategories = ['전필', '전선', '전심', '전기', '전공'];
  const generalCategories = ['교필', '교선', '교양', '기교'];
  
  if (majorCategories.some(cat => category.includes(cat))) {
    return 'major';
  }
  
  return 'general';
}
```

### 3. 교시 범위 → 슬롯 생성

**중요**: `startPeriod`부터 `endPeriod`까지 **각 교시별로 개별 슬롯 생성**

```typescript
// 예: startPeriod=21, endPeriod=22인 경우
// → 21교시 슬롯 + 22교시 슬롯 (총 2개 슬롯)

for (let period = item.startPeriod; period <= item.endPeriod; period++) {
  const periodInfo = periods[period]; // 교시 테이블에서 시간 정보 가져오기
  
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
}
```

---

## 📝 실제 변환 예제

### 입력 (API 응답)
```json
{
  "id": 470,
  "courseId": 537,
  "credit": 3,
  "professor": "이광영",
  "courseName": "임베디드시스템",
  "dayOfWeek": "TUE",
  "startPeriod": 21,
  "endPeriod": 22,
  "room": "북-317",
  "category": "전심",
  "recommendedGrade": 2
}
```

### 출력 (TimeSlot 배열)
```typescript
[
  {
    day: '화',
    time: '09:00',
    period: '21',
    subject: '임베디드시스템',
    courseCode: '537',
    room: '북-317',
    credits: 3,
    type: 'major'
  },
  {
    day: '화',
    time: '10:30',
    period: '22',
    subject: '임베디드시스템',
    courseCode: '537',
    room: '북-317',
    credits: 3,
    type: 'major'
  }
]
```

---

## 🔍 특수 케이스

### 1. 교양 교시와 전공 교시 혼합
```json
// 요가 (화요일 2-3교시, 교양)
{
  "dayOfWeek": "TUE",
  "startPeriod": 2,
  "endPeriod": 3,
  "category": "교선"
}
```
→ 교시 번호(1-9)를 보고 `GENERAL_PERIODS` 테이블 사용

### 2. 단일 교시 과목
```json
// 지식재산권과창업 (금요일 2교시만)
{
  "dayOfWeek": "FRI",
  "startPeriod": 2,
  "endPeriod": 2,
  "category": "전심"
}
```
→ 1개 슬롯만 생성

### 3. 긴 수업 (3-4교시)
```json
// 종합설계2 (금요일 23-24교시)
{
  "dayOfWeek": "FRI",
  "startPeriod": 23,
  "endPeriod": 24
}
```
→ 23교시 슬롯 + 24교시 슬롯 (2개)

---

## 💻 사용 방법

### 1. 유틸리티 함수 import
```typescript
import { 
  convertApiItemsToTimeSlots, 
  generateTimetableTitle,
  calculateCredits,
  type ApiCourseItem 
} from '../lib/timetableUtils';
```

### 2. API 응답 변환
```typescript
// API 호출
const response = await getRepresentativeTimetable();

if (response.success && response.data) {
  // TimeSlot 배열로 변환
  const slots = convertApiItemsToTimeSlots(response.data.items);
  
  // 제목 생성
  const title = response.data.title || 
                generateTimetableTitle(response.data.year, response.data.semester);
  
  // 학점 계산
  const { majorCredits, generalCredits, totalCredits } = calculateCredits(slots);
  
  // 상태 업데이트
  setTimetable({ title, slots });
}
```

### 3. 시간표 그리드 렌더링
```typescript
<TimetableGrid timetable={slots} />
```

---

## ✅ 검증 체크리스트

- [ ] 교시 번호가 올바른 시간대로 매핑되는가?
- [ ] 요일이 영문(MON)에서 한글(월)로 변환되는가?
- [ ] startPeriod부터 endPeriod까지 모든 슬롯이 생성되는가?
- [ ] 카테고리(전심, 교선)가 올바른 타입(major, general)으로 변환되는가?
- [ ] courseId가 문자열로 변환되어 저장되는가?
- [ ] 학점이 올바르게 전달되는가?

---

## 🐛 디버깅

### 교시 정보가 없다는 경고가 뜨는 경우
```
Warning: Period 21 not found in general periods for course ...
```

**원인**: 전공 교시(21-26)를 교양 교시 테이블에서 찾으려고 시도

**해결**: 
1. `getPeriodType()` 함수가 교시 번호를 올바르게 판단하는지 확인
2. 카테고리 매핑이 올바른지 확인

### 슬롯이 중복 생성되는 경우
**원인**: startPeriod와 endPeriod 범위 계산 오류

**해결**: 
```typescript
for (let period = item.startPeriod; period <= item.endPeriod; period++) {
  // <= 를 사용하여 endPeriod 포함
}
```

---

## 📚 참고 파일

- `/lib/timetableUtils.ts` - 핵심 변환 로직
- `/lib/timetableExample.ts` - 사용 예제
- `/components/TimetableGrid.tsx` - 시간표 렌더링
- `/components/ProfileScreen.tsx` - 실제 사용 예제
