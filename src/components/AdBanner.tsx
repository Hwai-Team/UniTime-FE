import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface AdBannerProps {
  onClose?: () => void;
  position?: 'top' | 'bottom' | 'inline';
}

// 학생 대상 광고 샘플 데이터
const sampleAds = [
  {
    id: 1,
    brand: 'Samsung',
    title: '갤럭시 북 학생 할인',
    description: '대학생 20% 특별 할인',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    color: 'from-blue-600/20 to-cyan-600/20',
  },
  {
    id: 2,
    brand: 'Starbucks',
    title: '대학생 전용 쿠폰',
    description: '음료 1+1 이벤트',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    color: 'from-green-600/20 to-emerald-600/20',
  },
  {
    id: 3,
    brand: 'Apple',
    title: '교육 할인 프로그램',
    description: 'MacBook Air 학생 할인',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    color: 'from-gray-600/20 to-slate-600/20',
  },
  {
    id: 4,
    brand: 'YES24',
    title: '대학생 도서 할인',
    description: '전공 서적 15% 할인',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    color: 'from-purple-600/20 to-pink-600/20',
  },
];

export default function AdBanner({ onClose, position = 'inline' }: AdBannerProps) {
  const randomAd = sampleAds[Math.floor(Math.random() * sampleAds.length)];

  if (position === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`relative p-4 bg-gradient-to-r ${randomAd.color} backdrop-blur-md border-white/15 overflow-hidden`}>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-1 top-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white size-7 z-10"
            >
              <X className="size-3" />
            </Button>
          )}
          
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0 border border-white/20"
              style={{ backgroundImage: `url(${randomAd.image})` }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/50 mb-1">광고</div>
              <h4 className="text-white text-sm mb-1">{randomAd.title}</h4>
              <p className="text-white/70 text-xs mb-2">{randomAd.description}</p>
              <Button 
                size="sm" 
                className="h-7 px-3 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                자세히 보기
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Top/Bottom banner style
  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full py-3 px-4 bg-gradient-to-r ${randomAd.color} backdrop-blur-md border-b border-white/10`}
    >
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-white/10 text-white/60 hover:text-white size-8"
        >
          <X className="size-4" />
        </Button>
      )}
      
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pr-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0 border border-white/20"
            style={{ backgroundImage: `url(${randomAd.image})` }}
          />
          <div>
            <div className="text-xs text-white/50">광고</div>
            <p className="text-white text-sm">
              <span className="font-medium">{randomAd.title}</span>
              <span className="text-white/70 ml-2">{randomAd.description}</span>
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="flex-shrink-0 bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          자세히 보기
        </Button>
      </div>
    </motion.div>
  );
}
