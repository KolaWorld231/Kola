"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Video, RefreshCw, ShoppingCart, Loader2 } from "lucide-react";
import { formatTimeUntilNextHeart } from "@/lib/hearts";

interface HeartRecoveryProps {
  currentHearts: number;
  maxHearts?: number;
  nextRecoveryTime?: Date | string | null;
  timeUntilNextHeart?: number | null;
  onRecover?: () => void;
  onWatchAd?: () => void;
  className?: string;
}


export function HeartRecovery({
  currentHearts,
  maxHearts = 5,
  nextRecoveryTime: _nextRecoveryTime,
  timeUntilNextHeart,
  onRecover,
  onWatchAd,
  className,
}: HeartRecoveryProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeUntilNextHeart || null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1000) {
          // Time's up, try to recover
          if (onRecover) {
            onRecover();
          }
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onRecover]);

  useEffect(() => {
    if (timeUntilNextHeart !== undefined) {
      setTimeRemaining(timeUntilNextHeart);
    }
  }, [timeUntilNextHeart]);

  const handleRecover = async () => {
    setIsRecovering(true);
    try {
      const response = await fetch("/api/user/hearts/recover", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.timeUntilNextHeart !== undefined) {
          setTimeRemaining(data.timeUntilNextHeart);
        }
        if (onRecover) {
          onRecover();
        }
      }
    } catch (error) {
      console.error("Error recovering hearts:", error);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    try {
      // In production, show ad modal here before calling API
      // For now, simulate ad display
      const watchAdPromise = new Promise<void>((resolve) => {
        // Simulate ad display time (2-5 seconds)
        setTimeout(() => {
          resolve();
        }, 3000);
      });

      await watchAdPromise;

      const response = await fetch("/api/user/hearts/watch-ad", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (onWatchAd) {
          onWatchAd();
        }
        // Show success message
        if (data.heartsRecovered > 0) {
          // Could use a toast notification here
          console.log(`Ad watched! +${data.heartsRecovered} Heart(s) recovered`);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to recover heart. Please try again.");
      }
    } catch (error) {
      console.error("Error watching ad:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsWatchingAd(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/user/hearts/purchase?amount=1", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (onWatchAd) {
          onWatchAd(); // Reuse onWatchAd callback to refresh hearts
        }
        // Show success message
        if (data.heartsPurchased > 0) {
          console.log(`Purchased ${data.heartsPurchased} heart(s) for ${data.xpSpent} XP`);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to purchase heart. Please try again.");
      }
    } catch (error) {
      console.error("Error purchasing heart:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const isFull = currentHearts >= maxHearts;

  if (isFull) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-success">
          <Heart className="h-5 w-5 fill-current" />
          <span className="font-semibold">Full Hearts!</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-destructive" />
          Heart Recovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hearts Display */}
        <div className="flex items-center gap-1">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart
              key={i}
              className={`h-6 w-6 ${
                i < currentHearts
                  ? "text-destructive fill-destructive"
                  : "text-foreground-light fill-none"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-foreground-light">
            {currentHearts} / {maxHearts}
          </span>
        </div>

        {/* Recovery Info */}
        {timeRemaining !== null && timeRemaining > 0 && (
          <div className="flex items-center gap-2 text-sm text-foreground-light">
            <Clock className="h-4 w-4" />
            <span>
              Next heart in: {formatTimeUntilNextHeart(timeRemaining)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecover}
              disabled={isRecovering || (timeRemaining !== null && timeRemaining > 0)}
              className="flex-1"
            >
              {isRecovering ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Recovery
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleWatchAd}
              disabled={isWatchingAd || isFull}
              className="flex-1"
            >
              {isWatchingAd ? (
                <>
                  <Video className="mr-2 h-4 w-4 animate-pulse" />
                  Watching...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Watch Ad
                </>
              )}
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handlePurchase}
            disabled={isPurchasing || isFull}
            className="w-full"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Purchasing...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase Heart (100 XP)
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-foreground-light">
          Hearts recover 1 every 4 hours, or watch an ad to recover instantly
        </p>
      </CardContent>
    </Card>
  );
}

