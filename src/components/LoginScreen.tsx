import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import type { User } from '../App';
import Logo from './Logo';
import { login, getMyProfile } from '../lib/api';

interface LoginScreenProps {
  setUser: (user: User) => void;
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile') => void;
}

export default function LoginScreen({ setUser, navigate }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요');
      return;
    }

    if (!email.endsWith('@skuniv.ac.kr')) {
      toast.error('서경대학교 이메일(@skuniv.ac.kr)을 사용해주세요');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      // 로그인 후 서버의 내 프로필 정보를 받아서 이름을 정확히 표시
      const me = await getMyProfile().catch(() => null as any);
      if (me) {
        setUser({
          email,
          name: me.name || '사용자',
          studentId: me.studentId || '',
          department: me.department || '',
          year: me.grade ? `${me.grade}학년` : '',
          graduationYear: me.graduationYear ? String(me.graduationYear) : '',
          plan: 'free',
          aiTimetablesCreated: 0,
        });
      } else {
        // fallback
        setUser({
          email,
          name: '사용자',
          studentId: '',
          department: '',
          year: '',
          graduationYear: '',
          plan: 'free',
          aiTimetablesCreated: 0,
        });
      }
      toast.success('로그인되었습니다');
      navigate('welcome');
    } catch (err: any) {
      const status = err?.status as number | undefined;
      if (status === 500 || status === 401 || status === 400) {
        toast.error('아이디 또는 비밀번호가 잘못되었습니다');
      } else {
        const message = err?.message || '로그인에 실패했습니다';
        toast.error(message);
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
            <Logo variant="full" size="lg" className="mb-4 justify-center" />
            <h2 className="text-white mb-2">로그인</h2>
            <p className="text-sm text-white/60">서경대학교 AI 시간표 빌더에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="size-4" />
                이메일
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
              <p className="text-xs text-white/40">서경대학교 이메일을 사용해주세요</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white flex items-center gap-2">
                <Lock className="size-4" />
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
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
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>

          <div className="flex items-center justify-between mt-6 text-sm">
            <button
              onClick={() => navigate('signup')}
              disabled={isLoading}
              className="text-purple-400 hover:text-purple-300 hover:underline disabled:opacity-50"
            >
              회원가입 하기
            </button>
            <button
              onClick={() => toast.info('비밀번호 찾기는 준비중입니다')}
              disabled={isLoading}
              className="text-white/60 hover:text-white/80 hover:underline disabled:opacity-50"
            >
              비밀번호 찾기
            </button>
          </div>
        </Card>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('welcome')}
            disabled={isLoading}
            className="text-sm text-white/60 hover:text-white/80 disabled:opacity-50"
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </motion.div>
    </div>
  );
}