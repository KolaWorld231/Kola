"use client";

import { PageTransition } from "@/components/page-transition";
import { SoundSettings } from "@/components/settings/sound-settings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SoundSettingsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-fresh-cream">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-fresh-dark">Sound Settings</h1>
            <p className="text-fresh-brown mt-2">Control sound effects and volume</p>
          </div>

          {/* Sound Settings Card */}
          <div className="max-w-xl">
            <SoundSettings />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
