import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useCommentReactions } from "@/hooks/useCommentReactions";
import { useAuth } from "@/hooks/useAuth";

interface CommentReactionsProps {
  commentId: string;
}

export const CommentReactions = ({ commentId }: CommentReactionsProps) => {
  const { user } = useAuth();
  const { reactions, toggleReaction } = useCommentReactions(commentId, user?.id);

  const handleLike = () => {
    if (!user) return;
    toggleReaction.mutate("like");
  };

  const handleDislike = () => {
    if (!user) return;
    toggleReaction.mutate("dislike");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={!user}
        className={`gap-1 ${
          reactions.userReaction === "like" 
            ? "text-primary bg-primary/10" 
            : "text-muted-foreground"
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="text-xs">{reactions.likes}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDislike}
        disabled={!user}
        className={`gap-1 ${
          reactions.userReaction === "dislike" 
            ? "text-destructive bg-destructive/10" 
            : "text-muted-foreground"
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="text-xs">{reactions.dislikes}</span>
      </Button>
    </div>
  );
};
