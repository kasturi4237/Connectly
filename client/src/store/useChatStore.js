import { create } from 'zustand';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  onlineUsers: [],
  isTyping: false,

  getUsers: async () => {
    try {
      const { data } = await axios.get('/users');
      set({ users: data });
    } catch (err) { toast.error('Failed to load users'); }
  },

  getMessages: async (userId) => {
    try {
      const { data } = await axios.get(`/messages/${userId}`);
      set({ messages: data });
    } catch (err) { toast.error('Failed to load messages'); }
  },

  sendMessage: async (receiverId, messageData) => {
    try {
      const { data } = await axios.post(`/messages/send/${receiverId}`, messageData);
      set(state => ({ messages: [...state.messages, data] }));
    } catch (err) { toast.error('Failed to send message'); }
  },

  addMessage: (message) => {
    set(state => ({ messages: [...state.messages, message] }));
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setIsTyping: (val) => set({ isTyping: val }),
}));