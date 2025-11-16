// 시간표 API 응답 예제 및 사용법

import { convertApiItemsToTimeSlots, generateTimetableTitle, type ApiCourseItem } from './timetableUtils';

// API 응답 예제 (사용자가 제공한 실제 응답 구조)
const exampleApiResponse = {
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
      "dayOfWeek": "THU",
      "startPeriod": 25,
      "endPeriod": 26,
      "room": "혜-305",
      "category": "교선",
      "recommendedGrade": null
    },
    {
      "id": 469,
      "courseId": 566,
      "credit": 1,
      "professor": "박용진",
      "courseName": "지식재산권과창업",
      "dayOfWeek": "FRI",
      "startPeriod": 2,
      "endPeriod": 2,
      "room": "북-107",
      "category": "전심",
      "recommendedGrade": 2
    },
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
    },
    {
      "id": 471,
      "courseId": 543,
      "credit": 3,
      "professor": "조근호",
      "courseName": "회로망및시뮬레이션기초",
      "dayOfWeek": "TUE",
      "startPeriod": 23,
      "endPeriod": 24,
      "room": "북-106",
      "category": "전심",
      "recommendedGrade": 2
    },
    {
      "id": 472,
      "courseId": 552,
      "credit": 3,
      "professor": "김재현",
      "courseName": "스마트폰프로그래밍",
      "dayOfWeek": "THU",
      "startPeriod": 23,
      "endPeriod": 24,
      "room": "북-521",
      "category": "전심",
      "recommendedGrade": 2
    },
    {
      "id": 473,
      "courseId": 561,
      "credit": 3,
      "professor": "손웅락",
      "courseName": "종합설계2",
      "dayOfWeek": "FRI",
      "startPeriod": 23,
      "endPeriod": 24,
      "room": "북-502",
      "category": "전심",
      "recommendedGrade": 2
    },
    {
      "id": 474,
      "courseId": 229,
      "credit": 2,
      "professor": "홍지택",
      "courseName": "요가",
      "dayOfWeek": "TUE",
      "startPeriod": 2,
      "endPeriod": 3,
      "room": "문-1503",
      "category": "교선",
      "recommendedGrade": null
    }
  ]
};

// 사용 예제
export function exampleUsage() {
  // 1. API 응답을 TimeSlot 배열로 변환
  const timeSlots = convertApiItemsToTimeSlots(exampleApiResponse.items as ApiCourseItem[]);
  
  console.log('변환된 TimeSlots:', timeSlots);
  
  // 2. 시간표 제목 생성
  const title = generateTimetableTitle(exampleApiResponse.year, exampleApiResponse.semester);
  
  console.log('시간표 제목:', title); // "2025년도 2학기"
  
  // 3. 실제 화면에서 사용
  // setTimetable({ title, slots: timeSlots });
  
  return { title, slots: timeSlots };
}

// 예상 출력:
// timeSlots = [
//   // Advanced Calculus 2 (목요일 25-26교시, 전공 교시)
//   { day: '목', time: '15:00', period: '25', subject: 'Advanced Calculus 2', courseCode: '106', room: '혜-305', credits: 3, type: 'general' },
//   { day: '목', time: '16:30', period: '26', subject: 'Advanced Calculus 2', courseCode: '106', room: '혜-305', credits: 3, type: 'general' },
//   
//   // 지식재산권과창업 (금요일 2교시, 교양 교시)
//   { day: '금', time: '10:00', period: '2', subject: '지식재산권과창업', courseCode: '566', room: '북-107', credits: 1, type: 'major' },
//   
//   // 임베디드시스템 (화요일 21-22교시, 전공 교시)
//   { day: '화', time: '09:00', period: '21', subject: '임베디드시스템', courseCode: '537', room: '북-317', credits: 3, type: 'major' },
//   { day: '화', time: '10:30', period: '22', subject: '임베디드시스템', courseCode: '537', room: '북-317', credits: 3, type: 'major' },
//   
//   // ... 나머지 과목들
// ]

// ProfileScreen에서 API 호출 후 사용 예제
export async function loadTimetablesFromAPI() {
  try {
    // 예: AI 대표 시간표 가져오기
    // const response = await getRepresentativeTimetable();
    
    // if (response.success && response.data) {
    //   const apiData = response.data;
    //   const slots = convertApiItemsToTimeSlots(apiData.items);
    //   const title = apiData.title || generateTimetableTitle(apiData.year, apiData.semester);
    //   
    //   setAiTimetable({
    //     id: String(apiData.id),
    //     createdAt: new Date(apiData.createdAt).toLocaleString('ko-KR'),
    //     slots,
    //   });
    // }
    
    console.log('API 로드 예제');
  } catch (error) {
    console.error('Failed to load timetables:', error);
  }
}

// ChatbotScreen에서 AI 생성 시간표 처리 예제
export function handleAIGeneratedTimetableResponse(apiResponse: any) {
  // API 응답 구조:
  // {
  //   id: 96,
  //   year: 2025,
  //   semester: 2,
  //   title: "...",
  //   items: [...]
  // }
  
  const slots = convertApiItemsToTimeSlots(apiResponse.items as ApiCourseItem[]);
  const title = apiResponse.title || generateTimetableTitle(apiResponse.year, apiResponse.semester);
  
  return { title, slots };
}
