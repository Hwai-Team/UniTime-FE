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
  const isAI = message.sender === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`max-w-[70%] ${isAI ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-2xl px-4 py-3 backdrop-blur-md ${
            isAI
              ? 'bg-white/5 border border-white/10 text-white'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(140,69,255,0.3)]'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <div
          className={`text-xs text-white/40 mt-1 px-2 ${
            isAI ? 'text-left' : 'text-right'
          }`}
        >
          {message.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
}
