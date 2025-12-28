import React from 'react';
import { TemplateType } from '../types';
import { Palette, Briefcase, Gamepad2 } from 'lucide-react';

interface TemplateCardProps {
  type: TemplateType;
  onClick: (type: TemplateType) => void;
  disabled: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ type, onClick, disabled }) => {
  let title = '';
  let description = '';
  let icon = null;
  let colorClass = '';

  switch (type) {
    case TemplateType.Creative:
      title = 'Creative Portfolio';
      description = 'Colorful, modern, artistic. Great for photos.';
      icon = <Palette className="w-6 h-6" />;
      colorClass = 'hover:border-purple-500 hover:bg-purple-50 text-purple-700 border-purple-200';
      break;
    case TemplateType.Minimalist:
      title = 'Minimalist Pro';
      description = 'Clean, black & white, organized. Best for resumes.';
      icon = <Briefcase className="w-6 h-6" />;
      colorClass = 'hover:border-slate-800 hover:bg-slate-50 text-slate-800 border-slate-200';
      break;
    case TemplateType.Cyberpunk:
      title = 'Neon Cyberpunk';
      description = 'Dark mode, glowing neon, futuristic. For gamers.';
      icon = <Gamepad2 className="w-6 h-6" />;
      colorClass = 'hover:border-green-400 hover:bg-zinc-900 hover:text-green-400 bg-black text-green-500 border-green-900';
      break;
  }

  return (
    <button
      onClick={() => onClick(type)}
      disabled={disabled}
      className={`
        flex flex-col items-start p-4 border-2 rounded-xl transition-all duration-200 w-full text-left
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1'}
        ${colorClass}
      `}
    >
      <div className="mb-2 p-2 rounded-full bg-white/20 backdrop-blur-sm">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </button>
  );
};

export default TemplateCard;