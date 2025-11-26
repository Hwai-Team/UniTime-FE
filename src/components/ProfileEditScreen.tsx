import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../App';
import { updateMyProfile } from '../lib/api';

interface ProfileEditScreenProps {
  user: User;
  setUser: (user: User) => void;
  navigate: (screen: 'welcome' | 'chatbot' | 'login' | 'signup' | 'profile') => void;
}

export default function ProfileEditScreen({ user, setUser, navigate }: ProfileEditScreenProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    studentId: user.studentId,
    department: user.department,
    year: user.year,
    email: user.email,
    graduationYear: user.graduationYear || '',
  });

  const handleSave = async () => {
    try {
      const grade = Number(String(formData.year).replace(/[^0-9]/g, '') || '0');
      const graduationYearNum = Number(String(formData.graduationYear).replace(/[^0-9]/g, '') || '0');
      await updateMyProfile({
        name: formData.name,
        studentId: formData.studentId,
        department: formData.department,
        grade,
        graduationYear: graduationYearNum,
      });
      setUser({
        ...user,
        ...formData,
      });
      toast.success('프로필이 성공적으로 수정되었습니다.');
      navigate('profile');
    } catch (err: any) {
      toast.error(err?.message || '프로필 수정에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#020103] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 size-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 size-96 bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('profile')}
            className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            프로필로 돌아가기
          </Button>
        </div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-black/60 backdrop-blur-md border-white/15">
            <div className="mb-6">
              <h2 className="text-white text-2xl mb-2">프로필 수정</h2>
              <p className="text-white/60 text-sm">회원 정보를 수정할 수 있습니다.</p>
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="size-24 bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 overflow-hidden">
                  <img 
                    src="/default-profile.png" 
                    alt="프로필" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 이모지로 대체
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<span class="text-5xl">👨‍🎓</span>';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50"
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* Student ID */}
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-white/80">학번</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50"
                  placeholder="학번을 입력하세요"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-white/80">학과</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="bg-black/40 border-white/20 text-white focus:border-purple-500/50">
                    <SelectValue placeholder="학과를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/20 text-white">
                    <SelectItem value="컴퓨터공학과">컴퓨터공학과</SelectItem>
                    <SelectItem value="소프트웨어학과">소프트웨어학과</SelectItem>
                    <SelectItem value="전자공학과">전자공학과</SelectItem>
                    <SelectItem value="전자컴퓨터공학과">전자컴퓨터공학과</SelectItem>
                    <SelectItem value="경영학과">경영학과</SelectItem>
                    <SelectItem value="경제학과">경제학과</SelectItem>
                    <SelectItem value="국어국문학과">국어국문학과</SelectItem>
                    <SelectItem value="영어영문학과">영어영문학과</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-white/80">학년</Label>
                <Select 
                  value={formData.year} 
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                >
                  <SelectTrigger className="bg-black/40 border-white/20 text-white focus:border-purple-500/50">
                    <SelectValue placeholder="학년을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/20 text-white">
                    <SelectItem value="1학년">1학년</SelectItem>
                    <SelectItem value="2학년">2학년</SelectItem>
                    <SelectItem value="3학년">3학년</SelectItem>
                    <SelectItem value="4학년">4학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="text-white/80">졸업년도</Label>
                <Select 
                  value={formData.graduationYear} 
                  onValueChange={(value) => setFormData({ ...formData, graduationYear: value })}
                >
                  <SelectTrigger className="bg-black/40 border-white/20 text-white focus:border-purple-500/50">
                    <SelectValue placeholder="졸업년도를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/20 text-white">
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                    <SelectItem value="2029">2029</SelectItem>
                    <SelectItem value="2030">2030</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-black/40 border-white/20 text-white/50 placeholder:text-white/40"
                />
                <p className="text-xs text-white/40">이메일은 수정할 수 없습니다.</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => navigate('profile')}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.4)]"
                >
                  <Save className="size-4" />
                  저장
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
