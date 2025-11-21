"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Flame, Gem, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { toast } from "sonner";

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<{
    totalXP: number;
    hearts: number;
    currentStreak: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          setUser({
            totalXP: data.totalXP || 0,
            hearts: data.hearts || 5,
            currentStreak: data.currentStreak || 0,
          });
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setIsLoading(false);
        });
    }
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Shop items (using XP as currency for now)
  const shopItems = [
    {
      id: "hearts-5",
      name: "Full Hearts",
      description: "Restore all 5 hearts instantly",
      price: 350, // XP cost
      icon: Heart,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      id: "streak-freeze",
      name: "Streak Freeze",
      description: "Protect your streak for one day",
      price: 200,
      icon: Flame,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      id: "double-xp",
      name: "Double XP Boost",
      description: "Earn 2x XP for 30 minutes",
      price: 150,
      icon: Sparkles,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: "time-freeze",
      name: "Time Freeze",
      description: "Pause heart regeneration timer",
      price: 100,
      icon: Gem,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ];

  const canAfford = (price: number) => user.totalXP >= price;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-liberian-red mb-2 flex items-center gap-3">
                <ShoppingBag className="h-10 w-10" />
                Shop
              </h1>
              <p className="text-lg text-gray-600">
                Use your XP to purchase helpful items and boosts
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Your Balance</div>
              <div className="text-3xl font-bold text-liberian-blue">
                {user.totalXP.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>

        {/* Shop Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {shopItems.map((item) => {
            const Icon = item.icon;
            const affordable = canAfford(item.price);

            return (
              <Card
                key={item.id}
                className={`border-2 transition-all hover:shadow-lg ${
                  affordable
                    ? `${item.borderColor} hover:border-liberian-red`
                    : "border-gray-200 opacity-60"
                }`}
              >
                <CardHeader className={`${item.bgColor} pb-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-8 w-8 ${item.iconColor}`} />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-liberian-blue">
                        {item.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">XP</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  <Button
                    className={`w-full ${
                      affordable
                        ? "bg-liberian-red hover:bg-liberian-red/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!affordable}
                    onClick={async () => {
                      if (!affordable) return;
                      try {
                        const response = await fetch("/api/shop/purchase", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ itemId: item.id }),
                        });
                        const data = await response.json();
                        if (response.ok) {
                          toast.success(data.message || "Purchase successful!", {
                            description: data.hearts !== undefined ? `Hearts: ${data.hearts}` : `XP remaining: ${data.xpRemaining?.toLocaleString()}`,
                          });
                          // Refresh user data
                          fetch("/api/user/me")
                            .then((res) => res.json())
                            .then((userData) => {
                              setUser({
                                totalXP: userData.totalXP || 0,
                                hearts: userData.hearts || 5,
                                currentStreak: userData.currentStreak || 0,
                              });
                            })
                            .catch(console.error);
                        } else {
                          toast.error(data.error || "Purchase failed");
                        }
                      } catch (error) {
                        toast.error("An error occurred. Please try again.");
                      }
                    }}
                  >
                    {affordable ? "Purchase" : "Insufficient XP"}
                  </Button>
                  {!affordable && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Need {item.price - user.totalXP} more XP
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <Card className="bg-gradient-to-r from-liberian-red/10 to-liberian-blue/10 border-liberian-red/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="h-6 w-6 text-liberian-red" />
              More Items Coming Soon!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We&apos;re constantly adding new items to the shop. Check back soon for:
            </p>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>Exclusive avatars and profile themes</li>
              <li>Premium lesson unlocks</li>
              <li>Special achievement badges</li>
              <li>Bonus practice sessions</li>
              <li>And much more!</li>
            </ul>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Gem className="h-6 w-6 text-liberian-blue flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How to Earn XP</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Complete lessons, exercises, and daily challenges to earn XP. The more you learn, the more XP you earn!
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Complete a lesson: 10-20 XP</div>
                  <div>• Complete an exercise: 5 XP</div>
                  <div>• Daily challenge reward: 10-20 XP</div>
                  <div>• Achievement unlock: 0-50 XP</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  );
}

