export interface Message {
  role: string;
  content: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
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