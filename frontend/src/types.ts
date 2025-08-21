export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  tokenAmount: number;
  setTokenAmount: (amount: number) => void;
  min_p: number;
  setMin_P: (val: number) => void;
  top_p: number;
  setTop_P: (val: number) => void;
  top_k: number;
  setTop_K: (val: number) => void;
  presence_penalty: number;
  setPresence_Penalty: (val: number) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
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
  showStats: boolean;
  setShowStats: (value: boolean) => void;
}

export interface HeaderProps {
  onMenuClick: () => void;
}

export interface MessageItemProps {
  response: string;
  isStreaming: boolean;
  isLastItem: boolean;
  stats?: { totalTokens: number; tokensPerSecond: number };
  showStats: boolean;
  messageIndex: number;
  onEdit?: (index: number, newMessage: string) => void;
}

export interface MessageListProps {
  responses: string[];
  isStreaming: boolean;
  stats: Record<number, { totalTokens: number; tokensPerSecond: number }>;
  showStats: boolean;
  onEdit?: (index: number, newMessage: string) => void;
}

export interface InputFormProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}