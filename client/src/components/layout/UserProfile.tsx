import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function UserProfile() {
  const { user, signOut, authLoading } = useAuth();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition">
        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="ml-3 flex-1">
          <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-gray-700 rounded mt-1 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="user-profile flex items-center p-2 rounded-lg hover:bg-gray-800/50 transition duration-200 justify-between">
      <div className="flex items-center flex-1 min-w-0">
        <Avatar className="w-8 h-8">
          {user.pictureUrl ? (
            <AvatarImage src={user.pictureUrl} alt={user.displayName} />
          ) : (
            <AvatarFallback className="bg-gray-700 text-gray-300">
              {user.displayName.substring(0, 2)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="ml-3 truncate">
          <p className="text-sm font-medium text-gray-200 truncate">{user.displayName}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        disabled={authLoading}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <i className="ri-logout-box-r-line"></i>
      </Button>
    </div>
  );
}
