import React from 'react';
import { Message, Sender } from '../types';
import CodeBlock from './CodeBlock';
import { Sparkles, User as UserIcon } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.Bot;

  return (
    <div className={`flex w-full mb-8 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border
          ${isBot ? 'bg-stone-900 text-amber-50 border-stone-800' : 'bg-white text-stone-600 border-stone-200'}
        `}>
          {isBot ? <Sparkles size={18} strokeWidth={1.5} /> : <UserIcon size={18} strokeWidth={1.5} />}
        </div>

        {/* Content Bubble */}
        <div className="flex flex-col items-start w-full">
          <div className={`
            p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap font-medium
            ${isBot 
              ? 'bg-white text-stone-800 rounded-tl-none border border-stone-100' 
              : 'bg-stone-800 text-stone-50 rounded-tr-none shadow-md'}
          `}>
            {message.text}
          </div>

          {message.type === 'code' && message.codeContent && (
            <div className="mt-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CodeBlock code={message.codeContent} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;