// ChatMessage.tsx
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const baseBubbleClass =
    'chat-typography text-[15px] leading-7 tracking-tight whitespace-pre-wrap break-words';
  const [displayText, setDisplayText] = useState(
    isUser ? message.text : '',
  );

  useEffect(() => {
    if (isUser || !message.animate) {
      setDisplayText(message.text);
      return;
    }

    let currentIndex = 0;
    setDisplayText('');

    const tick = () => {
      currentIndex += 1;
      setDisplayText((prev) =>
        message.text.slice(0, Math.min(currentIndex, message.text.length)),
      );
      if (currentIndex >= message.text.length) {
        clearInterval(interval);
      }
    };

    const interval = window.setInterval(tick, 18);
    return () => {
      clearInterval(interval);
    };
  }, [message.text, isUser, message.animate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-4`}
    >
      <div
        className={`flex items-start gap-2 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className="min-w-0">
          {isUser ? (
            // ✅ 사용자 메시지: 회색 말풍선
            <div
              className={[
                'inline-block',
                'max-w-[min(80vw,500px)]',
                'rounded-2xl px-4 py-2.5',
                'bg-white/15 text-white',
                'backdrop-blur-md',
                'shadow-[0_12px_30px_rgba(0,0,0,0.35)]',
                baseBubbleClass,
                'font-semibold',
              ].join(' ')}
              style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
            >
              {displayText}
            </div>
          ) : (
            // ✅ AI 메시지: 블록 없이 자연스럽게 텍스트만
            <div
              className={[
                'max-w-[min(90vw,820px)]',
                'rounded-2xl px-5 py-3',
                'bg-gradient-to-br from-white/8 to-white/0',
                'shadow-[0_18px_45px_rgba(0,0,0,0.45)]',
                'text-left text-white/95',
                baseBubbleClass,
              ].join(' ')}
              style={{ wordBreak: 'break-word' }}
            >
              {displayText}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}