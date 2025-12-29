import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";
import { MarkdownContent } from "@/components/MarkdownContent";
import { CommentReactions } from "@/components/CommentReactions";
import { useComments } from "@/hooks/useComments";
import { useCommentUsers } from "@/hooks/useCommentUsers";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useCommentReports } from "@/hooks/useCommentReports";
import { validateCommentContent } from "@/utils/linkValidator";
import { MessageSquare, Send, Trash2, Reply, MoreVertical, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface CommentSectionProps {
  productId: string;
}

export const CommentSection = ({ productId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const { comments, isLoading, createComment, deleteComment } = useComments(productId);
  const { data: commentUsers = [] } = useCommentUsers(productId);
  const { user } = useAuth();
  const { data: isAdmin } = useAdmin();
  const { reportComment } = useCommentReports();

  const INITIAL_COMMENTS_COUNT = 5;
  const displayedComments = showAllComments 
    ? comments 
    : comments?.slice(0, INITIAL_COMMENTS_COUNT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    // Validar se contém links
    const validation = validateCommentContent(newComment);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    createComment.mutate(
      { content: newComment, userId: user.id },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim() || !user) return;

    // Validar se contém links
    const validation = validateCommentContent(replyContent);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    createComment.mutate(
      { content: replyContent, userId: user.id, parentId: commentId },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyingTo(null);
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Tem certeza que deseja remover este comentário?")) {
      deleteComment.mutate(commentId);
    }
  };

  const handleReport = (commentId: string, reportType: string) => {
    reportComment.mutate({ commentId, reportType });
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
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <RichTextEditor
                value={newComment}
                onChange={setNewComment}
                placeholder="Deixe seu comentário sobre este produto..."
                users={commentUsers}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={!newComment.trim() || createComment.isPending}
              className="gap-2 self-end mb-1"
            >
              <Send className="h-4 w-4" />
              Comentar
            </Button>
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
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : comments && comments.length > 0 ? (
          <>
            <div className={showAllComments ? "max-h-[600px] overflow-y-auto space-y-3 pr-2" : "space-y-3"}>
              {displayedComments?.map((comment) => {
            const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: ptBR,
            });

            return (
              <div key={comment.id} className="space-y-2">
                <Card className="p-3">
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profile?.avatar_url || ""} />
                      <AvatarFallback>
                        {comment.profile?.full_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">
                            {comment.profile?.full_name || "Usuário"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{comment.profile?.username || "usuario"} · {timeAgo}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {user && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="gap-1"
                            >
                              <Reply className="h-4 w-4" />
                              Responder
                            </Button>
                          )}
                          {user && (user.id === comment.user_id || isAdmin) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(comment.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {user && user.id !== comment.user_id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleReport(comment.id, "spam")}>
                                  <Flag className="mr-2 h-4 w-4" />
                                  Denunciar como Spam
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReport(comment.id, "offensive")}>
                                  <Flag className="mr-2 h-4 w-4" />
                                  Denunciar como Ofensivo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      <div className="text-sm">
                        <MarkdownContent content={comment.content} />
                      </div>
                      
                      {/* Reações do comentário */}
                      <CommentReactions commentId={comment.id} />
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && user && (
                    <div className="mt-3 ml-10">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <RichTextEditor
                            value={replyContent}
                            onChange={setReplyContent}
                            placeholder="Escreva sua resposta..."
                            users={commentUsers}
                          />
                        </div>
                        <div className="flex flex-col gap-2 self-end mb-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyContent.trim() || createComment.isPending}
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 space-y-2">
                    {comment.replies.map((reply: any) => {
                      const replyTimeAgo = formatDistanceToNow(new Date(reply.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      });

                      return (
                        <Card key={reply.id} className="p-2 bg-muted/50">
                          <div className="flex gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={reply.profile?.avatar_url || ""} />
                              <AvatarFallback>
                                {reply.profile?.full_name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {reply.profile?.full_name || "Usuário"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    @{reply.profile?.username || "usuario"} · {replyTimeAgo}
                                  </p>
                                </div>
                                {user && (user.id === reply.user_id || isAdmin) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(reply.id)}
                                    className="text-destructive hover:text-destructive h-8"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <div className="text-sm">
                                <MarkdownContent content={reply.content} />
                              </div>
                              
                              {/* Reações da resposta */}
                              <CommentReactions commentId={reply.id} />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
            </div>
            
            {/* Botão para ver mais comentários */}
            {!showAllComments && comments.length > INITIAL_COMMENTS_COUNT && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllComments(true)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Continuar vendo comentários ({comments.length - INITIAL_COMMENTS_COUNT} restantes)
                </Button>
              </div>
            )}
          </>
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
