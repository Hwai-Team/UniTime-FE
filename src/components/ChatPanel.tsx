import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2, Users, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onShowSeniorTimetables?: () => void;
  onResetChat?: () => void;
}

export default function ChatPanel({ 
  messages, 
  onSendMessage, 
  isLoading = false,
  onShowSeniorTimetables,
  onResetChat
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm border-r border-white/10">
      {/* Header with action buttons */}
      <div className="p-3 border-b border-white/10 backdrop-blur-md bg-black/40 flex items-center gap-2">
        <Button
          onClick={onShowSeniorTimetables}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-white/60 hover:text-white hover:bg-white/10 text-xs h-8 px-3"
        >
          <Users className="size-3.5" />
          선배들의 시간표
        </Button>
        <Button
          onClick={() => {
            if (window.confirm('모든 대화 내용과 시간표가 초기화됩니다.\n정말 초기화하시겠습니까?')) {
              onResetChat?.();
            }
          }}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8 px-3"
        >
          <RotateCcw className="size-3.5" />
          대화 초기화
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md px-4">
              <div className="size-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(140,69,255,0.4)]">
                <MessageSquare className="size-8 text-white" />
              </div>
              <h2 className="text-white">시간표 생성 시작</h2>
              <p className="text-white/60 text-sm">
                학년, 전공, 선호 시간대를 알려주시면<br />
                AI가 최적의 시간표를 생성해드립니다
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 w-fit">
                <Loader2 className="size-5 text-purple-400 animate-spin" />
                <span className="text-white/80 text-sm">AI가 답변을 생성하고 있습니다...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 backdrop-blur-md bg-black/40">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isLoading ? "AI가 답변 중..." : "메시지 입력..."}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 px-4 disabled:opacity-50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            size="icon"
            className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(140,69,255,0.5)] flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}