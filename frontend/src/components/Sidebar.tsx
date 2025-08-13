import type { SidebarProps } from '../types';

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  temperature, 
  setTemperature,
  tokenAmount,
  setTokenAmount,
  min_p,
  setMin_P,
  top_p,
  setTop_P,
  top_k,
  setTop_K,
  presence_penalty,
  setPresence_Penalty,
}) => {
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
            <button className="w-full p-3 text-left hover:bg-gray-200 font-black text-sm">
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
              <label className="block text-sm font-black mb-1">MAX TOKENS</label>
              <input 
                type="number"
                className="w-full p-2 border-2 border-black font-mono text-sm" 
                value={tokenAmount}
                onChange={(e) => setTokenAmount(parseInt(e.target.value))}
              />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <label className="block text-sm font-black">MODEL TEMPERATURE</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="pl-2 w-11 border-2 border-black font-mono text-sm outline-none border-none focus:ring-0 appearance-none"
                  style={{
                    MozAppearance: 'textfield',
                    appearance: 'textfield'
                  }}
                />
              </div>
              <input 
                type="range" 
                min="0"
                max="1"
                step="0.1" 
                className="w-full h-2 bg-black appearance-none cursor-pointer" 
                style={{
                  background: `linear-gradient(to right, black ${temperature * 100}%, #ffffff ${temperature * 100}%)`
                }}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <label className="block text-sm font-black">MIN_P</label>
                <input
                  type="number"
                  step="0.05"
                  value={min_p}
                  onChange={(e) => setMin_P(parseFloat(e.target.value))}
                  className="pl-2 w-11 border-2 border-black font-mono text-sm outline-none border-none focus:ring-0 appearance-none"
                  style={{
                    MozAppearance: 'textfield',
                    appearance: 'textfield'
                  }}
                />
              </div>
              <input 
                type="range" 
                min="0"
                max="1"
                step="0.05" 
                className="w-full h-2 bg-black appearance-none cursor-pointer" 
                style={{
                  background: `linear-gradient(to right, black ${min_p * 100}%, #ffffff ${min_p * 100}%)`
                }}
                value={min_p}
                onChange={(e) => setMin_P(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <label className="block text-sm font-black">TOP_P</label>
                <input
                  type="number"
                  step="0.05"
                  value={top_p}
                  onChange={(e) => setTop_P(parseFloat(e.target.value))}
                  className="pl-2 w-11 border-2 border-black font-mono text-sm outline-none border-none focus:ring-0 appearance-none"
                  style={{
                    MozAppearance: 'textfield',
                    appearance: 'textfield'
                  }}
                />
              </div>
              <input 
                type="range" 
                min="0"
                max="1"
                step="0.05" 
                className="w-full h-2 bg-black appearance-none cursor-pointer" 
                style={{
                  background: `linear-gradient(to right, black ${top_p * 100}%, #ffffff ${top_p * 100}%)`
                }}
                value={top_p}
                onChange={(e) => setTop_P(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <label className="block text-sm font-black">TOP_K</label>
                <input
                  type="number"
                  step="1"
                  value={top_k}
                  onChange={(e) => setTop_K(parseFloat(e.target.value))}
                  className="pl-2 w-11 border-2 border-black font-mono text-sm outline-none border-none focus:ring-0 appearance-none"
                  style={{
                    MozAppearance: 'textfield',
                    appearance: 'textfield'
                  }}
                />
              </div>
              <input 
                type="range" 
                min="0"
                max="100"
                step="1" 
                className="w-full h-2 bg-black appearance-none cursor-pointer" 
                style={{
                  background: `linear-gradient(to right, black ${top_k}%, #ffffff ${top_k}%)`
                }}
                value={top_k}
                onChange={(e) => setTop_K(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <label className="block text-sm font-black">Presence Penalty</label>
                <input
                  type="number"
                  step="0.1"
                  value={presence_penalty}
                  onChange={(e) => setPresence_Penalty(parseFloat(e.target.value))}
                  className="pl-2 w-11 border-2 border-black font-mono text-sm outline-none border-none focus:ring-0 appearance-none"
                  style={{
                    MozAppearance: 'textfield',
                    appearance: 'textfield'
                  }}
                />
              </div>
              <input 
                type="range" 
                min="-2.0"
                max="2.0"
                step="0.1" 
                className="w-full h-2 bg-black appearance-none cursor-pointer" 
                style={{ 
                  background: `linear-gradient(to right, black ${((presence_penalty + 2) / 4) * 100}%, #ffffff ${((presence_penalty + 2) / 4) * 100}%)` }}
                value={presence_penalty}
                onChange={(e) => setPresence_Penalty(parseFloat(e.target.value))}
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