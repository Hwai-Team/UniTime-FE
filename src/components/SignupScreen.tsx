import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from './ui/alert-dialog';
import { toast } from 'sonner';
import { signup, type ApiError } from '../lib/api';
import type { User } from '../App';

interface SignupScreenProps {
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile') => void;
  setUser: (user: User) => void;
}

export default function SignupScreen({ navigate, setUser }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name || !studentId || !department || !year) {
      toast.error('모든 필수 항목을 입력해주세요');
      return;
    }

    // 이메일 형식 검증 (백엔드에서 추가 검증 가능)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('올바른 이메일 형식을 입력해주세요');
      return;
    }

    if (!graduationYear) {
      toast.error('졸업년도를 선택해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // API 호출
      const response = await signup({
        email,
        password,
        name,
        department,
        grade: parseInt(year, 10),
        studentId,
        graduation_year: graduationYear,
      });

      const fallbackGrade = parseInt(year, 10) || 0;
      const userData = response.user ?? {
        email,
        name,
        studentId,
        department,
        grade: fallbackGrade,
        graduation_year: graduationYear,
        plan: 'free' as const,
      };

      const resolvedGrade = userData.grade || fallbackGrade;
      const resolvedGraduation =
        userData.graduation_year ?? graduationYear ?? '';

      const newUser: User = {
        userId: response.user?.userId ?? response.userId,
        email: userData.email,
        name: userData.name,
        studentId: userData.studentId,
        department: userData.department,
        year: resolvedGrade ? `${resolvedGrade}학년` : '',
        graduationYear: resolvedGraduation ? String(resolvedGraduation) : undefined,
        plan: userData.plan ?? 'free',
        aiTimetablesCreated: 0,
      };

      setUser(newUser);
      toast.success('회원가입이 완료되었습니다!');
      setShowWelcomeDialog(true);
    } catch (error) {
      console.error('Signup error:', error);
      const apiError = error as ApiError;
      
      if (apiError.errors && apiError.errors.length > 0) {
        // 필드별 에러 메시지
        const errorMessage = apiError.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        toast.error(errorMessage);
      } else if (apiError.message) {
        toast.error(apiError.message);
      } else if (apiError.error) {
        toast.error(apiError.error);
      } else {
        toast.error('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeDialogClose = () => {
    setShowWelcomeDialog(false);
    navigate('profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020103]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 size-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 left-20 size-96 bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 bg-black/80 backdrop-blur-xl border-white/15 shadow-[0_0_40px_rgba(140,69,255,0.3)]">
          <div className="text-center mb-6">
            <div className="size-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(140,69,255,0.5)]">
              <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-white">회원가입</h2>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">이메일 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일 (예: testuser@unitime.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">이름 *</Label>
              <Input
                id="name"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-white">학번 *</Label>
              <Input
                id="studentId"
                placeholder="학번"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-white">학과 *</Label>
              <Input
                id="department"
                placeholder="학과"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-white">학년 *</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="rounded-lg bg-white/5 border-white/15 text-white focus:border-purple-500/50 focus:ring-purple-500/20">
                  <SelectValue placeholder="학년 선택" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/15">
                  <SelectItem value="1" className="text-white focus:bg-white/10">1학년</SelectItem>
                  <SelectItem value="2" className="text-white focus:bg-white/10">2학년</SelectItem>
                  <SelectItem value="3" className="text-white focus:bg-white/10">3학년</SelectItem>
                  <SelectItem value="4" className="text-white focus:bg-white/10">4학년</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear" className="text-white">졸업년도 *</Label>
              <Select value={graduationYear} onValueChange={setGraduationYear}>
                <SelectTrigger className="rounded-lg bg-white/5 border-white/15 text-white focus:border-purple-500/50 focus:ring-purple-500/20">
                  <SelectValue placeholder="졸업년도 선택" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/15">
                  <SelectItem value="2024" className="text-white focus:bg-white/10">2024</SelectItem>
                  <SelectItem value="2025" className="text-white focus:bg-white/10">2025</SelectItem>
                  <SelectItem value="2026" className="text-white focus:bg-white/10">2026</SelectItem>
                  <SelectItem value="2027" className="text-white focus:bg-white/10">2027</SelectItem>
                  <SelectItem value="2028" className="text-white focus:bg-white/10">2028</SelectItem>
                  <SelectItem value="2029" className="text-white focus:bg-white/10">2029</SelectItem>
                  <SelectItem value="2030" className="text-white focus:bg-white/10">2030</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('login')}
                className="flex-1 rounded-lg bg-white/5 border-white/15 text-white hover:bg-white/10"
              >
                뒤로가기
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리 중...' : '회원가입 완료'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Welcome Dialog */}
      <AlertDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <AlertDialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 size-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(140,69,255,0.5)]">
              <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <AlertDialogTitle className="text-center text-white text-xl">
              회원가입 완료! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-white/80 space-y-3">
              <p>환영합니다, {name}님!</p>
              <p className="text-sm">
                프로필 화면에서 <span className="text-purple-400">이전 학기 시간표</span>를 추가하시면<br />
                더욱 정확한 AI 시간표 추천을 받으실 수 있습니다.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={handleWelcomeDialogClose}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)]"
            >
              프로필로 이동
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
