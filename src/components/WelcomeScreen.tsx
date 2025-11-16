import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sparkles, Upload, FileText, Menu, Calendar, Clock, Zap, CheckCircle, Target, Brain, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Logo from './Logo';

interface WelcomeScreenProps {
  onStartChat: (message: string) => void;
  navigate: (screen: 'chatbot' | 'login' | 'signup' | 'profile') => void;
  user: any;
}

export default function WelcomeScreen({ onStartChat, navigate, user }: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      if (!user) {
        navigate('login');
        return;
      }
      onStartChat(inputValue);
    }
  };

  const quickActions = [
    { icon: Sparkles, label: '2학년 컴퓨터공학과 시간표 생성', description: '전공과 교양 균형있게' },
    { icon: Calendar, label: '공강 화요일로 시간표 만들어줘', description: '원하는 요일 설정' },
    { icon: Clock, label: '오전 수업만 있는 시간표', description: '시간대 맞춤 추천' },
  ];

  const features = [
    {
      icon: Calendar,
      title: 'AI 자동 시간표 생성',
      description: '학년, 전공, 원하는 요일을 입력하면 AI가 최적의 시간표를 자동으로 생성합니다.',
    },
    {
      icon: Clock,
      title: '시간대별 맞춤 추천',
      description: '전공(21-26교시)과 교양(1-9교시) 시간대를 고려한 효율적인 스케줄링을 제공합니다.',
    },
    {
      icon: Zap,
      title: '실시간 수정 및 최적화',
      description: '채팅으로 간편하게 과목을 추가, 삭제, 변경하여 나만의 완벽한 시간표를 만드세요.',
    },
    {
      icon: CheckCircle,
      title: '학수번호 자동 관리',
      description: '과목명과 학수번호를 자동으로 매칭하여 정확한 수강신청을 도와드립니다.',
    },
    {
      icon: Target,
      title: '학점 최적화',
      description: '전공과 교양 학점 배분을 고려하여 졸업 요건에 맞는 시간표를 추천합니다.',
    },
    {
      icon: Brain,
      title: 'CSV 간편 업로드',
      description: 'CSV 파일로 한번에 시간표를 등록하거나 내보낼 수 있어 편리합니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#020103] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-3">
          {user && (
            <Button
              onClick={() => navigate('chatbot')}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)] text-white"
            >
              <ArrowRight className="size-4" />
              채팅으로 이동
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => user ? navigate('profile') : navigate('login')}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/15"
          >
            {user ? user.name : '로그인'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center px-6 relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl w-full space-y-8 pt-12"
        >
          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-white text-5xl">
              어떤 시간표를 만들고 싶으신가요?
            </h1>
            <p className="text-white/60 text-lg">
              간단한 메시지로 시작하세요. AI가 자동으로 최적의 시간표를 생성합니다.
            </p>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-4 shadow-[0_0_40px_rgba(140,69,255,0.2)] hover:shadow-[0_0_60px_rgba(140,69,255,0.3)] transition-all">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="시간표를 만들어달라고 요청하세요... (예: 2학년 컴퓨터공학과 시간표 만들어줘)"
                className="border-0 bg-transparent text-white placeholder:text-white/40 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 pr-16"
              />
              <div className="absolute right-4 top-4">
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setInputValue(action.label)}
                  className="gap-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-xl px-4 py-2"
                >
                  <action.icon className="size-4" />
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-6xl w-full mt-32 space-y-12"
        >
          <div className="text-center space-y-3">
            <p className="text-purple-400 text-sm uppercase tracking-wider">서경대학교 학생들을 위한</p>
            <h2 className="text-white text-4xl">
              AI가 만드는 완벽한 시간표
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              전공과 교양을 균형있게 배치하고, 개인의 일정에 맞춘 최적의 시간표를 몇 초 만에 생성합니다.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="relative group"
              >
                <div className="h-full bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="size-6 text-purple-400" />
                  </div>
                  <h3 className="text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Demo Section with Timetable Screenshot */}
          <div className="pt-16 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-[100px] -z-10" />
              
              <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/15 rounded-3xl p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left - Description */}
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                      <Sparkles className="size-4 text-purple-400" />
                      <span className="text-purple-300 text-sm">실시간 미리보기</span>
                    </div>
                    
                    <h3 className="text-white text-3xl">
                      채팅으로 완성하는<br />
                      나만의 시간표
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="size-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white/90 mb-1">전공/교양 자동 구분</p>
                          <p className="text-white/60 text-sm">21-26교시는 전공, 1-9교시는 교양으로 자동 분류됩니다</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="size-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white/90 mb-1">실시간 학점 계산</p>
                          <p className="text-white/60 text-sm">과목을 추가할 때마다 전공/교양/총학점이 자동 계산됩니다</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="size-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white/90 mb-1">시간 겹침 자동 체크</p>
                          <p className="text-white/60 text-sm">같은 시간대에 중복된 과목이 있으면 즉시 알려드립니다</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => document.querySelector('input')?.focus()}
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_30px_rgba(140,69,255,0.4)] text-white px-6 py-6"
                    >
                      지금 바로 시작하기
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  {/* Right - Timetable Preview */}
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-2xl" />
                    <div className="relative bg-black/60 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 shadow-2xl">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">2학년 1학기 시간표</h4>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">전공 9학점</span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">교양 6학점</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Simple Timetable Grid Preview */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-6 gap-1 text-xs text-white/60 pb-2 border-b border-white/10">
                          <div></div>
                          <div className="text-center">월</div>
                          <div className="text-center">화</div>
                          <div className="text-center">수</div>
                          <div className="text-center">목</div>
                          <div className="text-center">금</div>
                        </div>
                        
                        {['09:00', '10:30', '12:00', '13:30', '15:00'].map((time, idx) => (
                          <div key={time} className="grid grid-cols-6 gap-1 text-xs">
                            <div className="text-white/40 text-right pr-2">{time}</div>
                            {[0, 1, 2, 3, 4].map((day) => {
                              const hasClass = (idx === 0 && day === 0) || (idx === 1 && day === 2) || (idx === 3 && day === 1) || (idx === 4 && day === 3);
                              return (
                                <div 
                                  key={day} 
                                  className={`h-12 rounded ${hasClass ? 'bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-purple-400/30' : 'bg-white/5'}`}
                                >
                                  {hasClass && (
                                    <div className="p-1 text-white/90 text-[10px] leading-tight">
                                      {idx === 0 && day === 0 && '프로그래밍'}
                                      {idx === 1 && day === 2 && '자료구조'}
                                      {idx === 3 && day === 1 && '영어회화'}
                                      {idx === 4 && day === 3 && '논리학'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="max-w-6xl w-full mt-20 pb-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <span className="text-white/60 text-sm">제작</span>
              <span className="text-white">화이팀</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}