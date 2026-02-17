import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ChatState = {
  messages: [],
  conversations: [],
  activeConversationId: null,
  loading: false,
  error: null,
};

// Create slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set messages
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Add message
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      // Update conversation's last message
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = action.payload;
        conversation.updatedAt = action.payload.timestamp;
      }
    },
    
    // Update message
    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    
    // Remove message
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    
    // Set conversations
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    
    // Add conversation
    addConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.push(action.payload);
    },
    
    // Update conversation
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },
    
    // Set active conversation
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    
    // Mark messages as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
      state.messages.forEach((m) => {
        if (m.conversationId === action.payload) {
          m.read = true;
        }
      });
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setConversations,
  addConversation,
  updateConversation,
  setActiveConversation,
  markAsRead,
  setLoading,
  setError,
  clearError,
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;

