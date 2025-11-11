// ChatMessage.tsx
import { motion } from 'motion/react';

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
                'text-sm leading-relaxed whitespace-pre-wrap tracking-tight',
                'bg-white/10 text-white',
                'backdrop-blur-md border border-white/10',
              ].join(' ')}
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {message.text}
            </div>
          ) : (
            // ✅ AI 메시지: 블록 없이 자연스럽게 텍스트만
            <div className="max-w-[min(90vw,820px)] text-sm leading-7 break-words whitespace-pre-wrap text-left text-white/90 tracking-tight">
              {message.text}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}