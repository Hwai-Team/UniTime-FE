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
        className="w-full max-w-lg"
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
            <h3 className="text-white mb-2">무료 시간표 제한</h3>
            <p className="text-sm text-white/60">
              무료 플랜에서는 1개의 AI 시간표만 생성할 수 있습니다.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="space-y-4 mb-6">
            {/* Free Plan */}
            <Card className="p-4 bg-white/5 border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white">무료 플랜</h4>
                  <p className="text-sm text-white/60 mt-1">현재 플랜</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-white">₩0</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400" />
                  AI 시간표 1개 생성
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400" />
                  기본 시간표 관리
                </li>
              </ul>
            </Card>

            {/* Premium Plan */}
            <Card className="p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30 shadow-[0_0_20px_rgba(140,69,255,0.2)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white">프리미엄 플랜</h4>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white">
                      추천
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mt-1">무제한 시간표 생성</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-white">₩9,900</p>
                  <p className="text-xs text-white/50">/월</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400" />
                  무제한 AI 시간표 생성
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400" />
                  고급 시간표 최적화
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400" />
                  우선 지원
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400" />
                  CSV 내보내기
                </li>
              </ul>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10"
            >
              나중에
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(140,69,255,0.4)]"
            >
              프리미엄으로 업그레이드
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
