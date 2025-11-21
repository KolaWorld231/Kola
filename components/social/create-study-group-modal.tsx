"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Users, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Language {
  id: string;
  name: string;
  flagEmoji: string | null;
  code: string;
}

interface CreateStudyGroupModalProps {
  onGroupCreated?: () => void;
  trigger?: React.ReactNode;
}

export function CreateStudyGroupModal({
  onGroupCreated,
  trigger,
}: CreateStudyGroupModalProps) {
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [maxMembers, setMaxMembers] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLanguages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchLanguages = async () => {
    try {
      setIsLoadingLanguages(true);
      const response = await fetch("/api/admin/languages");
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || []);
      }
    } catch (err) {
      console.error("Error fetching languages:", err);
      toast.error("Failed to load languages");
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (!selectedLanguageId) {
      toast.error("Please select a language");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          languageId: selectedLanguageId,
          isPublic,
          maxMembers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create study group");
      }

      toast.success("Study group created!");
      setOpen(false);
      resetForm();
      onGroupCreated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedLanguageId("");
    setIsPublic(true);
    setMaxMembers(50);
  };

  const selectedLanguage = languages.find((l) => l.id === selectedLanguageId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Users className="h-4 w-4" />
            Create Study Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
          <DialogDescription>
            Start a study group to learn together with friends!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kpelle Learners Club"
              required
              maxLength={100}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Select
              value={selectedLanguageId}
              onValueChange={setSelectedLanguageId}
              disabled={isLoadingLanguages}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {isLoadingLanguages ? "Loading languages..." : "No languages available"}
                  </div>
                ) : (
                  languages.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{language.flagEmoji}</span>
                        <span>{language.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your study group..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Public/Private */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="public" className="flex items-center gap-2">
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4" />
                    Public Group
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Private Group
                  </>
                )}
              </Label>
              <p className="text-xs text-gray-500">
                {isPublic
                  ? "Anyone can find and join this group"
                  : "Only invited members can join"}
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Max Members */}
          <div className="space-y-2">
            <Label htmlFor="maxMembers">Maximum Members</Label>
            <Input
              id="maxMembers"
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value) || 50)}
              min="2"
              max="100"
            />
            <p className="text-xs text-gray-500">
              Set the maximum number of members allowed in this group
            </p>
          </div>

          {/* Preview */}
          {selectedLanguage && name && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium mb-2">Group Preview</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">{selectedLanguage.flagEmoji}</span>
                <span className="font-semibold">{name}</span>
                {isPublic ? (
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
                <span className="text-gray-500">· Max {maxMembers} members</span>
              </div>
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
            <Button type="submit" disabled={isSubmitting || !name || !selectedLanguageId}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

