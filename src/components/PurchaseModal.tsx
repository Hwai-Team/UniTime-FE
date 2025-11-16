import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseModalProps {
  onClose: () => void;
  onPurchase: () => void;
}

export default function PurchaseModal({ onClose, onPurchase }: PurchaseModalProps) {
  const handlePurchase = () => {
    toast.success('프리미엄으로 업그레이드되었습니다!');
    onPurchase();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl"
      >
        <Card className="relative p-8 bg-black/90 backdrop-blur-xl border-white/15 shadow-[0_0_40px_rgba(140,69,255,0.3)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full hover:bg-white/10 text-white"
          >
            <X className="size-4" />
          </Button>
          
          <div className="text-center mb-6">
            <div className="size-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(140,69,255,0.5)]">
              <Sparkles className="size-8 text-white" />
            </div>
            <h3 className="text-white mb-2">요금제 선택</h3>
            <p className="text-sm text-white/60">
              나에게 맞는 플랜을 선택하세요
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Free Plan with Ads */}
            <Card className="p-5 bg-white/5 border-white/10 flex flex-col">
              <div className="flex-1">
                <div className="mb-4">
                  <h4 className="text-white mb-1">무료 플랜</h4>
                  <div className="text-2xl text-white mb-1">₩0</div>
                  <p className="text-sm text-white/50">한 달 무료 체험</p>
                </div>
                <ul className="space-y-2 text-sm text-white/70 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    광고 시청 필요
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    기본 시간표 생성
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    유료 기능 횟수 제한
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    맞춤형 광고 및 프로모션
                  </li>
                </ul>
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-400">
                  학생 대상 브랜드 제휴 혜택 제공
                </p>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="p-5 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30 shadow-[0_0_20px_rgba(140,69,255,0.2)] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-white">프리미엄 플랜</h4>
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white">
                  추천
                </span>
              </div>
              <div className="flex-1">
                <div className="mb-4">
                  <div className="text-2xl text-white mb-1">₩9,900</div>
                  <p className="text-sm text-white/50">월 구독</p>
                </div>
                <ul className="space-y-2 text-sm text-white/90 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    광고 없음
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    무제한 시간표 생성
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    고급 AI 최적화
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    우선 지원
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-purple-400 flex-shrink-0" />
                    데이터 내보내기
                  </li>
                </ul>
              </div>
              <Button
                onClick={handlePurchase}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)] mt-4"
              >
                프리미엄 시작하기
              </Button>
            </Card>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              나중에 결정할게요
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}