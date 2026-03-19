import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import NoChatSelected from '../components/chat/NoChatSelected';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { selectedUser, setOnlineUsers, addMessage, setIsTyping } = useChatStore();

  useEffect(() => {
    const socket = connectSocket(user._id);
    socket.on('onlineUsers', setOnlineUsers);
    socket.on('newMessage', addMessage);
    socket.on('typing', ({ senderId, isTyping }) => {
      if (selectedUser?._id === senderId) setIsTyping(isTyping);
    });
    return () => disconnectSocket();
  }, [user._id]);

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {selectedUser ? <ChatWindow /> : <NoChatSelected />}
      </div>
    </div>
  );
}