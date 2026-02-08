"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserCheck, UserX } from "lucide-react";

interface Friend {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  totalXP: number;
  currentStreak: number;
}

interface FriendRequest {
  id: string;
  sender: Friend;
  receiver: Friend;
  status: string;
  createdAt: string;
}

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchFriends();
      fetchRequests();
    }
  }, [status, router]);

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (response.ok) {
        // Refresh search results or show success
        searchUsers();
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      if (response.ok) {
        fetchRequests();
        fetchFriends();
      }
    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };

  if (status === "loading") {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Friends</h1>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">My Friends</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="search">Find Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="flex items-center space-x-4 p-4">
                  <Avatar>
                    <AvatarImage src={friend.image || ""} />
                    <AvatarFallback>
                      {friend.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{friend.name || "No name"}</h3>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{friend.totalXP} XP</Badge>
                      <Badge variant="outline">{friend.currentStreak} day streak</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {friends.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No friends yet. Start by finding some!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={request.sender.image || ""} />
                      <AvatarFallback>
                        {request.sender.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{request.sender.name || "No name"}</h3>
                      <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => respondToRequest(request.id, true)}
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToRequest(request.id, false)}
                    >
                      <UserX className="mr-1 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchUsers()}
              />
              <Button onClick={searchUsers} disabled={loading}>
                <Search className="mr-1 h-4 w-4" />
                Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((user) => (
                <Card key={user.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.name || "No name"}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(user.id)}
                    >
                      <UserPlus className="mr-1 h-4 w-4" />
                      Add Friend
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {searchResults.length === 0 && searchQuery && !loading && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No users found.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}