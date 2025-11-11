import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { login, type ApiError } from '../lib/api';
import type { User } from '../App';

interface LoginScreenProps {
  setUser: (user: User) => void;
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile') => void;
}

export default function LoginScreen({ setUser, navigate }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password });
      const userData = response.user ?? {
        userId: response.userId,
        email,
        name: '',
        studentId: '',
        department: '',
        grade: 0,
        graduation_year: '',
        plan: 'free' as const,
      };

      const resolvedGrade = userData.grade || 0;
      const resolvedGraduation =
        userData.graduation_year ?? '';

      const loggedInUser: User = {
        userId: userData.userId ?? response.userId,
        email: userData.email,
        name: userData.name,
        studentId: userData.studentId,
        department: userData.department,
        year: resolvedGrade ? `${resolvedGrade}학년` : '',
        graduationYear: resolvedGraduation ? String(resolvedGraduation) : undefined,
        plan: userData.plan ?? 'free',
        aiTimetablesCreated: 0,
      };

      setUser(loggedInUser);
      toast.success('로그인되었습니다');
      navigate('welcome');
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as ApiError;

      if (apiError.status === 500) {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (apiError.errors && apiError.errors.length > 0) {
        const errorMessage = apiError.errors
          .map((item) => `${item.field}: ${item.message}`)
          .join('\n');
        toast.error(errorMessage);
      } else if (apiError.message) {
        toast.error(apiError.message);
      } else if (apiError.error) {
        toast.error(apiError.error);
      } else {
        toast.error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020103]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 size-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 size-96 bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 bg-black/80 backdrop-blur-xl border-white/15 shadow-[0_0_40px_rgba(140,69,255,0.3)]">
          <div className="text-center mb-8">
            <div className="size-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(140,69,255,0.5)]">
              <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-white mb-2">로그인</h2>
            <p className="text-sm text-white/60">서경대학교 AI 시간표 빌더</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">이메일</Label>
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
              <Label htmlFor="password" className="text-white">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('signup')}
              className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
            >
              회원가입 하기
            </button>
          </div>
        </Card>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('welcome')}
            className="text-sm text-white/60 hover:text-white/80"
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
