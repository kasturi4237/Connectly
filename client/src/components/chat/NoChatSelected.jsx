import { MessageSquare } from 'lucide-react';

export default function NoChatSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-gray-500">
      <MessageSquare size={64} className="mb-4 text-gray-700" />
      <h2 className="text-xl font-semibold text-gray-400">Select a conversation</h2>
      <p className="text-sm mt-2">Choose a user from the sidebar to start chatting</p>
    </div>
  );
}