import type { HeaderProps } from '../types';

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b-4 border-black">
      <button
        onClick={onMenuClick}
        className="w-10 h-10 bg-black text-white font-black hover:bg-gray-800 flex flex-col items-center justify-center gap-0.5"
      >
        <div className="w-4 h-0.5 bg-white"></div>
        <div className="w-4 h-0.5 bg-white"></div>
        <div className="w-4 h-0.5 bg-white"></div>
      </button>
      <h1 className="text-4xl font-black uppercase tracking-wider">NOESIS</h1>
      <div className="w-10 h-10"></div>
    </div>
  );
};
