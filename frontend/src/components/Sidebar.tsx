import type { SidebarProps } from '../types';

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, temperature }) => {
  return (
    <>
      <div className={`absolute top-0 left-0 h-full w-full md:w-80 lg:w-96 bg-white border-r-4 border-black transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b-4 border-black">
          <h2 className="text-4xl font-black uppercase">MENU</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 text-xl bg-black text-white font-black hover:bg-gray-800 flex items-center justify-center text-base"
          >
            ×
          </button>
        </div>

        <div className="border-b-4 border-black">
          <div className="p-4 bg-gray-100 border-b-2 border-black">
            <h3 className="font-black uppercase text-sm">CHAT HISTORY</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="p-3 border-b border-gray-300 hover:bg-gray-50 cursor-pointer">
              <div className="text-sm font-mono truncate">Previous conversation 1...</div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
            <div className="p-3 border-b border-gray-300 hover:bg-gray-50 cursor-pointer">
              <div className="text-sm font-mono truncate">Another chat session...</div>
              <div className="text-xs text-gray-500">Yesterday</div>
            </div>
            <button className="w-full p-3 text-left hover:bg-gray-50 font-black text-sm">
              + NEW CHAT
            </button>
          </div>
        </div>

        <div>
          <div className="p-4 bg-gray-100 border-b-2 border-black">
            <h3 className="font-black uppercase text-sm">SETTINGS</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-black mb-1">MODEL TEMPERATURE</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                className="w-full h-2" 
                value={temperature}
                defaultValue="0.7"
              />
            </div>
            <div>
              <label className="block text-sm font-black mb-1">MAX TOKENS</label>
              <input 
                type="number" 
                className="w-full p-2 border-2 border-black font-mono text-sm" 
                defaultValue="1000"
              />
            </div>
            <button className="w-full p-2 bg-black text-white font-black hover:bg-gray-800 text-sm">
              CLEAR HISTORY
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute inset-0 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
};