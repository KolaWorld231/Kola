"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Check, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  username: string | null;
  password?: boolean; // Indicates if user has a password set
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameValidation, setUsernameValidation] = useState<{
    checking: boolean;
    valid: boolean | null;
    available: boolean | null;
    error: string | null;
  }>({
    checking: false,
    valid: null,
    available: null,
    error: null,
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (key: keyof UserProfile, value: string | null) => {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
    setHasChanges(true);

    // Validate username in real-time
    if (key === "username") {
      validateUsername(value || "");
    }
  };

  // Debounced username validation
  let usernameValidationTimeout: NodeJS.Timeout;
  const validateUsername = async (username: string) => {
    // Clear previous timeout
    if (usernameValidationTimeout) {
      clearTimeout(usernameValidationTimeout);
    }

    // Reset validation state if username is empty
    if (!username || username.trim().length === 0) {
      setUsernameValidation({
        checking: false,
        valid: null,
        available: null,
        error: null,
      });
      return;
    }

    // Debounce the API call
    usernameValidationTimeout = setTimeout(async () => {
      setUsernameValidation({ checking: true, valid: null, available: null, error: null });

      try {
        const response = await fetch(`/api/user/username/check?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (data.available && data.valid) {
          setUsernameValidation({
            checking: false,
            valid: true,
            available: true,
            error: null,
          });
        } else {
          setUsernameValidation({
            checking: false,
            valid: data.valid || false,
            available: data.available || false,
            error: data.error || "Username is not available",
          });
        }
      } catch (error) {
        console.error("Error validating username:", error);
        setUsernameValidation({
          checking: false,
          valid: null,
          available: null,
          error: "Error checking username availability",
        });
      }
    }, 500); // 500ms debounce
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (profile) {
          setProfile({ ...profile, image: data.url });
        }
        toast.success("Avatar uploaded successfully");
        // Update session to reflect new avatar
        await update();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsSaving(false);
      // Reset input
      event.target.value = "";
    }
  };

  const handleAvatarRemove = async () => {
    if (!confirm("Are you sure you want to remove your avatar?")) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (response.ok) {
        if (profile) {
          setProfile({ ...profile, image: null });
        }
        toast.success("Avatar removed successfully");
        // Update session
        await update();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to remove avatar");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove avatar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate username if changed
    if (profile.username && profile.username.trim().length > 0) {
      if (usernameValidation.valid === false || usernameValidation.available === false) {
        toast.error(usernameValidation.error || "Please fix the username before saving");
        return;
      }
      // If validation is still checking, wait a bit
      if (usernameValidation.checking) {
        toast.error("Please wait for username validation to complete");
        return;
      }
    }

    // Validate passwords if changing
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword) {
        toast.error("Please fill in current and new password");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("New password must be at least 8 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        setHasChanges(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Update session
        await update();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground-darkMode mb-2">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.name || "User"}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-border-darkMode object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-liberian-blue border-2 border-gray-200 dark:border-border-darkMode flex items-center justify-center text-2xl font-bold text-white">
              {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
            </div>
          )}
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-liberian-blue text-white flex items-center justify-center border-2 border-white hover:bg-liberian-blue/90 cursor-pointer transition-colors"
            title="Change avatar"
          >
            <Pencil className="h-3 w-3" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={isSaving}
          />
        </div>
        {profile.image && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAvatarRemove}
            disabled={isSaving}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Remove Avatar
          </Button>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={profile.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            className="h-12 text-base"
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-base font-medium">
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              value={profile.username || ""}
              onChange={(e) => updateField("username", e.target.value)}
              className={cn(
                "h-12 text-base pr-10",
                usernameValidation.valid === false && "border-red-500 focus-visible:ring-red-500",
                usernameValidation.valid === true && usernameValidation.available && "border-green-500 focus-visible:ring-green-500"
              )}
              placeholder="Enter username (3-20 characters)"
            />
            {profile.username && profile.username.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameValidation.checking ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : usernameValidation.valid === true && usernameValidation.available ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : usernameValidation.valid === false || usernameValidation.available === false ? (
                  <X className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          {usernameValidation.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{usernameValidation.error}</p>
          )}
          {!usernameValidation.error && profile.username && usernameValidation.valid && usernameValidation.available && (
            <p className="text-sm text-green-600 dark:text-green-400">Username is available!</p>
          )}
          {!usernameValidation.error && !profile.username && (
            <p className="text-sm text-gray-500 dark:text-foreground-darkModeLight">
              Choose a unique username (3-20 characters, letters, numbers, underscores, and hyphens)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="h-12 text-base bg-gray-50 dark:bg-background-darkModeSecondary"
          />
          <p className="text-sm text-gray-500 dark:text-foreground-darkModeLight">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-password" className="text-base font-medium">
            Current password
          </Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setHasChanges(true);
              }}
              className="h-12 text-base pr-12"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-foreground-darkModeLight hover:text-gray-700 dark:hover:text-foreground-darkMode"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-base font-medium">
            New password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setHasChanges(true);
              }}
              className="h-12 text-base pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-foreground-darkModeLight hover:text-gray-700 dark:hover:text-foreground-darkMode"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {newPassword && <PasswordStrengthMeter password={newPassword} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-base font-medium">
            Confirm new password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={cn(
              "h-12 text-base font-semibold",
              hasChanges
                ? "bg-liberian-blue hover:bg-liberian-blue/90 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-foreground-darkModeLight cursor-not-allowed"
            )}
          >
            {isSaving ? "Saving..." : "SAVE CHANGES"}
          </Button>

          <div className="space-y-2 pt-4">
            <button 
              onClick={async () => {
                try {
                  const response = await fetch("/api/user/export-data");
                  if (response.ok) {
                    const data = await response.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `kola-data-export-${Date.now()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success("Data exported successfully");
                  } else {
                    toast.error("Failed to export data");
                  }
                } catch (error) {
                  console.error("Error exporting data:", error);
                  toast.error("Failed to export data");
                }
              }}
              className="text-sm text-liberian-blue hover:underline"
            >
              EXPORT MY DATA
            </button>
            <div>
              <button 
                onClick={async () => {
                  const confirmed = confirm(
                    "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted."
                  );
                  
                  if (!confirmed) return;

                  // If user has a password, prompt for it
                  let confirmPassword: string | null = null;
                  if (profile.password) {
                    confirmPassword = prompt("Please enter your password to confirm account deletion:");
                    if (!confirmPassword) {
                      toast.info("Account deletion cancelled");
                      return;
                    }
                  }

                  try {
                    const response = await fetch("/api/user/delete-account", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ confirmPassword }),
                    });

                    if (response.ok) {
                      toast.success("Account deleted successfully");
                      // Redirect to home page after a delay
                      setTimeout(() => {
                        window.location.href = "/";
                      }, 2000);
                    } else {
                      const data = await response.json();
                      toast.error(data.error || "Failed to delete account");
                    }
                  } catch (error) {
                    console.error("Error deleting account:", error);
                    toast.error("Failed to delete account");
                  }
                }}
                className="text-sm text-red-600 hover:underline"
              >
                DELETE MY ACCOUNT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

