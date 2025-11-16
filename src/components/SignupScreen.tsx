import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from './ui/alert-dialog';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, Hash, GraduationCap, Calendar, Building } from 'lucide-react';
import type { User } from '../App';
import Logo from './Logo';
import { signup } from '../lib/api';

interface SignupScreenProps {
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile') => void;
  setUser: (user: User) => void;
}

export default function SignupScreen({ navigate, setUser }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name || !studentId || !department || !year) {
      toast.error('모든 필수 항목을 입력해주세요');
      return;
    }

    if (!email.endsWith('@skuniv.ac.kr')) {
      toast.error('서경대학교 이메일(@skuniv.ac.kr)을 사용해주세요');
      return;
    }

    if (password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      setIsLoading(true);
      await signup({
        email,
        password,
        name,
        department,
        grade: Number(year.replace(/[^0-9]/g, '') || '0'),
        studentId,
      });

      const newUser: User = {
        email,
        name,
        studentId,
        department,
        year,
        graduationYear,
        plan: 'free',
        aiTimetablesCreated: 0,
      };

      setUser(newUser);
      toast.success('회원가입이 완료되었습니다!');
      setShowWelcomeDialog(true);
    } catch (err: any) {
      const message = err?.message || '회원가입에 실패했습니다';
      toast.error(message);
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
            <Logo variant="full" size="lg" className="mb-4 justify-center" />
            <h2 className="text-white mb-2">회원가입</h2>
            <p className="text-sm text-white/60">지금 가입하고 AI 시간표를 무료로 생성하세요</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="size-4" />
                이메일 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@skuniv.ac.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 disabled:opacity-50"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center gap-2">
                  <Lock className="size-4" />
                  비밀번호 <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="6자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 pr-10 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white flex items-center gap-2">
                  <Lock className="size-4" />
                  확인 <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 pr-10 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                <UserIcon className="size-4" />
                이름 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-white flex items-center gap-2">
                  <Hash className="size-4" />
                  학번 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="studentId"
                  placeholder="20210001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isLoading}
                  className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-white flex items-center gap-2">
                  <GraduationCap className="size-4" />
                  학년 <span className="text-red-400">*</span>
                </Label>
                <Select value={year} onValueChange={setYear} disabled={isLoading}>
                  <SelectTrigger className="rounded-lg bg-white/5 border-white/15 text-white focus:border-purple-500/50 focus:ring-purple-500/20 disabled:opacity-50">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-white/15">
                    <SelectItem value="1학년" className="text-white focus:bg-white/10">1학년</SelectItem>
                    <SelectItem value="2학년" className="text-white focus:bg-white/10">2학년</SelectItem>
                    <SelectItem value="3학년" className="text-white focus:bg-white/10">3학년</SelectItem>
                    <SelectItem value="4학년" className="text-white focus:bg-white/10">4학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-white flex items-center gap-2">
                <Building className="size-4" />
                학과 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="department"
                placeholder="컴퓨터공학과"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isLoading}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear" className="text-white flex items-center gap-2">
                <Calendar className="size-4" />
                졸업년도
              </Label>
              <Select value={graduationYear} onValueChange={setGraduationYear} disabled={isLoading}>
                <SelectTrigger className="rounded-lg bg-white/5 border-white/15 text-white focus:border-purple-500/50 focus:ring-purple-500/20 disabled:opacity-50">
                  <SelectValue placeholder="선택 (선택사항)" />
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

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('login')}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-white/5 border-white/15 text-white hover:bg-white/10 disabled:opacity-50"
              >
                뒤로가기
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    가입 중...
                  </>
                ) : (
                  '회원가입 완료'
                )}
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