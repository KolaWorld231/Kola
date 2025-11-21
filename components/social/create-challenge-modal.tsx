"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Target, Flame, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Friend {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  totalXP: number;
  currentStreak: number;
}

interface CreateChallengeModalProps {
  friends: Friend[];
  onChallengeCreated?: () => void;
  trigger?: React.ReactNode;
}

export function CreateChallengeModal({
  friends,
  onChallengeCreated,
  trigger,
}: CreateChallengeModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string>("");
  const [challengeType, setChallengeType] = useState<string>("lesson");
  const [target, setTarget] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const challengeTypes = [
    {
      value: "lesson",
      label: "Complete Lesson",
      icon: <Target className="h-4 w-4" />,
      description: "Challenge to complete a specific lesson",
    },
    {
      value: "xp",
      label: "Earn XP",
      icon: <Trophy className="h-4 w-4" />,
      description: "Challenge to earn a certain amount of XP",
    },
    {
      value: "streak",
      label: "Maintain Streak",
      icon: <Flame className="h-4 w-4" />,
      description: "Challenge to maintain a learning streak",
    },
    {
      value: "accuracy",
      label: "Achieve Accuracy",
      icon: <CheckCircle2 className="h-4 w-4" />,
      description: "Challenge to achieve a certain accuracy percentage",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFriendId) {
      toast.error("Please select a friend");
      return;
    }

    if (!challengeType) {
      toast.error("Please select a challenge type");
      return;
    }

    if (challengeType !== "lesson" && !target) {
      toast.error("Please enter a target value");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/challenges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedFriendId,
          type: challengeType,
          target: target || null,
          description: description || null,
          expiresInDays,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create challenge");
      }

      toast.success("Challenge sent!");
      setOpen(false);
      resetForm();
      onChallengeCreated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFriendId("");
    setChallengeType("lesson");
    setTarget("");
    setDescription("");
    setExpiresInDays(7);
  };

  const selectedFriend = friends.find((f) => f.id === selectedFriendId);
  const selectedType = challengeTypes.find((t) => t.value === challengeType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Challenge Friend
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Challenge</DialogTitle>
          <DialogDescription>
            Challenge a friend to learn together and compete!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Friend Selection */}
          <div className="space-y-2">
            <Label htmlFor="friend">Challenge Friend</Label>
            <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a friend" />
              </SelectTrigger>
              <SelectContent>
                {friends.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No friends yet. Add friends first!
                  </div>
                ) : (
                  friends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                      <div className="flex items-center gap-2">
                        {friend.image ? (
                          <Image
                            src={friend.image}
                            alt={friend.name || "User"}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-liberian-blue text-white flex items-center justify-center text-xs font-semibold">
                            {friend.name?.[0]?.toUpperCase() || friend.email[0].toUpperCase()}
                          </div>
                        )}
                        <span>{friend.name || "User"}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Challenge Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Challenge Type</Label>
            <Select value={challengeType} onValueChange={setChallengeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select challenge type" />
              </SelectTrigger>
              <SelectContent>
                {challengeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target */}
          {challengeType !== "lesson" && (
            <div className="space-y-2">
              <Label htmlFor="target">
                Target{" "}
                {challengeType === "xp"
                  ? "(XP amount)"
                  : challengeType === "streak"
                  ? "(Days)"
                  : challengeType === "accuracy"
                  ? "(Percentage)"
                  : ""}
              </Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={
                  challengeType === "xp"
                    ? "e.g., 100"
                    : challengeType === "streak"
                    ? "e.g., 7"
                    : challengeType === "accuracy"
                    ? "e.g., 80"
                    : ""
                }
                min="1"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Message (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a message to motivate your friend..."
              rows={3}
            />
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expires">Expires In (Days)</Label>
            <Input
              id="expires"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
              min="1"
              max="30"
            />
          </div>

          {/* Preview */}
          {selectedFriend && selectedType && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium mb-2">Challenge Preview</p>
              <p className="text-sm text-gray-600">
                You&apos;re challenging{" "}
                <span className="font-semibold">{selectedFriend.name || "User"}</span> to{" "}
                <span className="font-semibold">{selectedType.label.toLowerCase()}</span>
                {target && (
                  <>
                    {" "}
                    (Target: <span className="font-semibold">{target}</span>)
                  </>
                )}
                . Expires in {expiresInDays} day{expiresInDays !== 1 ? "s" : ""}.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedFriendId || friends.length === 0}>
              {isSubmitting ? "Sending..." : "Send Challenge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

