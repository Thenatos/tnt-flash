import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface User {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface MentionAutocompleteProps {
  users: User[];
  onSelect: (username: string) => void;
  position: { top: number; left: number };
  searchQuery: string;
}

export const MentionAutocomplete = ({
  users,
  onSelect,
  position,
  searchQuery,
}: MentionAutocompleteProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredUsers.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
      } else if (e.key === "Enter" && filteredUsers[selectedIndex]) {
        e.preventDefault();
        onSelect(filteredUsers[selectedIndex].username);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredUsers, selectedIndex, onSelect]);

  if (filteredUsers.length === 0) return null;

  return (
    <Card
      ref={containerRef}
      className="absolute z-50 w-64 max-h-48 overflow-y-auto bg-background border shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="py-1">
        {filteredUsers.map((user, index) => (
          <button
            key={user.user_id}
            onClick={() => onSelect(user.username)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors ${
              index === selectedIndex ? "bg-accent" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback>
                {user.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.full_name || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
