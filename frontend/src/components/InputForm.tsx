import type { InputFormProps } from '../types';

export const InputForm: React.FC<InputFormProps> = ({ 
  input, 
  setInput, 
  onSubmit, 
  isStreaming, 
  textareaRef 
}) => {
  return (
    <div className="border-t-4 border-black bg-white p-4">
      <div className="w-full md:w-196 mx-auto">
        <form className="relative" onSubmit={onSubmit}>
          <div className="relative border-4 border-black bg-white">
            <textarea
              placeholder="ENTER TEXT..."
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && isStreaming === false) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              className="w-full px-4 py-4 pr-16 bg-white border-none focus:outline-none resize-none overflow-y-auto min-h-[2.5rem] max-h-48 font-mono text-black placeholder-gray-500 break-all"
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                const scrollHeight = e.currentTarget.scrollHeight;
                e.currentTarget.style.height = scrollHeight + 'px';
              }}
            />
            <button 
              type="submit"
              disabled={isStreaming}
              className="absolute bottom-2 right-2 w-10 h-10 bg-black text-white font-black text-xl hover:bg-gray-800 disabled:bg-gray-400 border-2 border-black flex items-center justify-center pt-1"
            >
              <span className="translate-y-0.5">{isStreaming ? '...' : '^'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};