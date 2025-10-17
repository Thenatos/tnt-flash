import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface CommentSectionProps {
  productId: string;
}

export const CommentSection = ({ productId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, createComment, deleteComment } = useComments(productId);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    createComment.mutate(
      { content: newComment, userId: user.id },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Tem certeza que deseja remover este comentário?")) {
      deleteComment.mutate(commentId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Comentários</h2>
        {comments && <span className="text-muted-foreground">({comments.length})</span>}
      </div>

      {/* Form de novo comentário */}
      {user ? (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <RichTextEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Deixe seu comentário sobre este produto..."
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                disabled={!newComment.trim() || createComment.isPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Comentar
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Faça login para deixar seu comentário
          </p>
          <Link to="/auth">
            <Button>Fazer Login</Button>
          </Link>
        </Card>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => {
            const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: ptBR,
            });

            return (
              <Card key={comment.id} className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.profile?.avatar_url || ""} />
                    <AvatarFallback>
                      {comment.profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {comment.profile?.full_name || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      </div>
                      {user && user.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-sm">
                      <MarkdownContent content={comment.content} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Seja o primeiro a comentar sobre este produto!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
