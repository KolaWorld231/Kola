"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Users, UserPlus, Globe, Lock, Crown, Shield, User } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  languageId: string;
  isPublic: boolean;
  maxMembers: number;
  createdAt: Date;
  language: {
    id: string;
    name: string;
    flagEmoji: string | null;
  };
  members: Array<{
    id: string;
    userId: string;
    studyGroupId: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      totalXP: number;
      currentStreak: number;
    };
  }>;
  _count: {
    members: number;
  };
}

interface StudyGroupsListProps {
  userId?: string;
  languageId?: string | null;
}

export function StudyGroupsList({ userId, languageId }: StudyGroupsListProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<string[]>([]); // IDs of groups user is member of

  useEffect(() => {
    fetchGroups();
    if (userId) {
      fetchUserGroups();
    }
  }, [userId, languageId]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (languageId) {
        params.append("languageId", languageId);
      }

      const response = await fetch(`/api/study-groups?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch study groups");
      }
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching study groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await fetch(`/api/study-groups?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserGroups(data.groups?.map((g: StudyGroup) => g.id) || []);
      }
    } catch (err) {
      console.error("Error fetching user groups:", err);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join group");
      }

      toast.success("Joined study group!");
      fetchGroups();
      if (userId) {
        fetchUserGroups();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!confirm("Are you sure you want to leave this study group?")) return;

    try {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to leave group");
      }

      toast.success("Left study group");
      fetchGroups();
      if (userId) {
        fetchUserGroups();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-liberian-gold" />;
      case "admin":
        return <Shield className="h-4 w-4 text-liberian-blue" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
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
    return <ErrorMessage title="Error loading study groups" message={error} onRetry={fetchGroups} />;
  }

  const isMember = (groupId: string) => userGroups.includes(groupId);

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No study groups found</p>
            <p className="text-sm text-gray-400 mt-2">
              {languageId
                ? "Try selecting a different language or create a new group!"
                : "Create a study group to get started!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => {
          const member = isMember(group.id);
          const userMembership = group.members.find((m) => m.userId === userId);
          const canJoin = !member && group._count.members < group.maxMembers;

          return (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      {group.isPublic ? (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    {group.description && (
                      <CardDescription className="mt-2">{group.description}</CardDescription>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{group.language.flagEmoji}</span>
                        <span>{group.language.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {group._count.members} / {group.maxMembers} members
                        </span>
                      </div>
                    </div>
                  </div>
                  {member ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeave(group.id)}
                      disabled={userMembership?.role === "owner"}
                      className="gap-2"
                    >
                      {userMembership?.role === "owner" ? (
                        <>
                          <Crown className="h-4 w-4" />
                          Owner
                        </>
                      ) : (
                        <>
                          Leave Group
                        </>
                      )}
                    </Button>
                  ) : canJoin ? (
                    <Button size="sm" onClick={() => handleJoin(group.id)} className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Join
                    </Button>
                  ) : (
                    <Badge variant="outline">Full</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {group.members.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Members</p>
                    <div className="flex flex-wrap gap-3">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50"
                        >
                          {member.user.image ? (
                            <Image
                              src={member.user.image}
                              alt={member.user.name || "User"}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-liberian-blue text-white flex items-center justify-center text-xs font-semibold">
                              {member.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <span className="text-sm font-medium">{member.user.name || "User"}</span>
                          </div>
                        </div>
                      ))}
                      {group._count.members > group.members.length && (
                        <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                          <span className="text-sm text-gray-600">
                            +{group._count.members - group.members.length} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

