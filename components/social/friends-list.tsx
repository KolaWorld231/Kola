"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { UserPlus, Search, UserCheck, UserX, Trophy, Flame } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Friend {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  totalXP: number;
  currentStreak: number;
  selectedLanguage: {
    name: string;
    flagEmoji: string | null;
  } | null;
  friendshipId: string;
  status: string;
  createdAt: Date;
}

interface PendingFriend {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  requestId: string;
  friendshipStatus?: string | null;
}

interface FriendsListProps {
  userId?: string;
  // userId prop is passed but not used directly - kept for future use
}

export function FriendsList({ userId: _userId }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [_pendingSent, setPendingSent] = useState<PendingFriend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PendingFriend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/friends");
      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }
      const data = await response.json();
      setFriends(data.friends || []);
      setPendingSent(data.pendingSent || []);
      setPendingReceived(data.pendingReceived || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching friends:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }

    // Debounce search by 300ms
    debouncedSearch.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error("Failed to search users");
        }
        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (err) {
        console.error("Error searching users:", err);
        toast.error("Failed to search users");
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSendRequest = async (friendId: string) => {
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, action: "send" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send friend request");
      }

      toast.success("Friend request sent!");
      fetchFriends();
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const pending = pendingReceived.find((p) => p.requestId === requestId);
      if (!pending) return;

      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: pending.id, action: "accept" }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      toast.success("Friend request accepted!");
      fetchFriends();
    } catch (err) {
      toast.error("Failed to accept friend request");
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      const pending = pendingReceived.find((p) => p.requestId === requestId);
      if (!pending) return;

      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: pending.id, action: "decline" }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline friend request");
      }

      toast.success("Friend request declined");
      fetchFriends();
    } catch (err) {
      toast.error("Failed to decline friend request");
    }
  };

  const handleRemove = async (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, action: "remove" }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove friend");
      }

      toast.success("Friend removed");
      fetchFriends();
    } catch (err) {
      toast.error("Failed to remove friend");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Error loading friends" message={error} onRetry={fetchFriends} />;
  }

  const filteredFriends = friends.filter((friend) =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add Friend Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Friend
          </CardTitle>
          <CardDescription>Search for users to add as friends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Search Results</p>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-liberian-blue text-white flex items-center justify-center font-semibold">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.name || "User"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {user.friendshipStatus === "accepted" ? (
                      <Badge variant="outline">Friends</Badge>
                    ) : user.friendshipStatus === "pending" ? (
                      <Badge variant="outline">Pending</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(user.id)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingReceived.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>You have {pendingReceived.length} pending friend request(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingReceived.map((pending) => (
                <div
                  key={pending.requestId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {pending.image ? (
                      <Image
                        src={pending.image}
                        alt={pending.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-liberian-blue text-white flex items-center justify-center font-semibold">
                        {pending.name?.[0]?.toUpperCase() || pending.email[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{pending.name || "User"}</p>
                      <p className="text-sm text-gray-500">{pending.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAccept(pending.requestId)}
                      className="gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecline(pending.requestId)}
                      className="gap-2"
                    >
                      <UserX className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle>Friends ({friends.length})</CardTitle>
          <CardDescription>Your friends and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No friends yet. Search above to add friends!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {friend.image ? (
                      <Image
                        src={friend.image}
                        alt={friend.name || "User"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-liberian-blue text-white flex items-center justify-center font-semibold text-lg">
                        {friend.name?.[0]?.toUpperCase() || friend.email[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{friend.name || "User"}</p>
                      <p className="text-sm text-gray-500 mb-2">{friend.email}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-liberian-gold" />
                          <span className="text-gray-600">{friend.totalXP.toLocaleString()} XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-gray-600">{friend.currentStreak} day streak</span>
                        </div>
                        {friend.selectedLanguage && (
                          <div className="flex items-center gap-1">
                            <span className="text-lg">{friend.selectedLanguage.flagEmoji}</span>
                            <span className="text-gray-600">{friend.selectedLanguage.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(friend.id)}
                    className="gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

