import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { startNewConversation } = useChat();

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-surface border-b border-gray-800 p-3 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        className="p-2 rounded-lg hover:bg-gray-800/50 transition"
        onClick={onMenuClick}
      >
        <i className="ri-menu-line text-lg text-gray-200"></i>
      </Button>
      
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
          <i className="ri-robot-2-line text-white"></i>
        </div>
        <h1 className="text-lg font-bold text-white">JARVIS</h1>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="p-2 rounded-lg hover:bg-gray-800/50 transition"
        onClick={startNewConversation}
      >
        <i className="ri-add-line text-lg text-gray-200"></i>
      </Button>
    </div>
  );
}
