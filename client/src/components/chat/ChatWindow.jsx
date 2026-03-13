import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getSocket } from '../../lib/socket';
import { Send, Image, Paperclip, X } from 'lucide-react';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';

export default function ChatWindow() {
  const { selectedUser, messages, getMessages, sendMessage, isTyping, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const emitTyping = (val) => {
    const socket = getSocket();
    if (socket) socket.emit('typing', { receiverId: selectedUser._id, isTyping: val });
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(selectedUser._id, { content: text, type: 'text' });
    setText('');
    emitTyping(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'chat-app');
      // Upload to cloudinary directly or via backend endpoint
      const { data } = await axios.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await sendMessage(selectedUser._id, { imageUrl: data.url, type: 'image' });
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-900 border-b border-gray-800">
        <div className="relative">
          <img src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=6366f1&color=fff`}
            className="w-10 h-10 rounded-full" alt="" />
          {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />}
        </div>
        <div>
          <p className="font-semibold">{selectedUser.username}</p>
          <p className="text-xs text-gray-400">
            {isTyping ? '✍️ typing...' : isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
        {messages.map(msg => {
          const isMine = msg.sender._id === user._id || msg.sender === user._id;
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isMine ? 'bg-indigo-600 rounded-br-sm' : 'bg-gray-800 rounded-bl-sm'
              }`}>
                {msg.type === 'image' && msg.imageUrl ? (
                  <img src={msg.imageUrl} className="rounded-lg max-w-full" alt="img" />
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <p className="text-xs mt-1 opacity-60 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer text-gray-400 hover:text-white transition">
            <Image size={20} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <input
            value={text}
            onChange={handleTextChange}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleSend} disabled={!text.trim() || uploading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 p-2 rounded-full transition">
            <Send size={18} />
          </button>
        </div>
        {uploading && <p className="text-xs text-gray-500 mt-1 ml-2">Uploading...</p>}
      </div>
    </div>
  );
}