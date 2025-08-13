export interface Message {
  role: string;
  content: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  temperature: number;
  setTemperature: (value: number) => void;
  tokenAmount: number;
  setTokenAmount: (value: number) => void;
  min_p:number;
  setMin_P: (value: number) => void;
  top_p:number;
  setTop_P: (value: number) => void;
  top_k:number;
  setTop_K: (value: number) => void;
  presence_penalty: number;
  setPresence_Penalty: (value: number) => void;
}

export interface HeaderProps {
  onMenuClick: () => void;
}

export interface MessageListProps {
  responses: string[];
  isStreaming: boolean;
}

export interface InputFormProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}