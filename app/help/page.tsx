"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, MessageCircle, AlertCircle, FileText, Settings } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Help & Support</h1>
          <p className="text-lg text-foreground-light">
            Find answers, get help, and learn how to use Kola
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Guide */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <CardTitle>User Guide</CardTitle>
              </div>
              <CardDescription>
                Complete guide to using Kola, from getting started to advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/user-guide">
                <Button className="w-full">Read Guide</Button>
              </Link>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="h-8 w-8 text-secondary" />
                <CardTitle>FAQ</CardTitle>
              </div>
              <CardDescription>Answers to frequently asked questions about Kola</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/faq">
                <Button variant="outline" className="w-full">
                  View FAQ
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-8 w-8 text-liberian-red" />
                <CardTitle>Troubleshooting</CardTitle>
              </div>
              <CardDescription>Solutions to common issues and problems</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/troubleshooting">
                <Button variant="outline" className="w-full">
                  Get Help
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Guide */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-8 w-8 text-liberian-blue" />
                <CardTitle>Admin Guide</CardTitle>
              </div>
              <CardDescription>Guide for administrators managing the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/admin-guide">
                <Button variant="outline" className="w-full">
                  Admin Docs
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-8 w-8 text-liberian-green" />
                <CardTitle>Contact Support</CardTitle>
              </div>
              <CardDescription>Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-liberian-yellow" />
                <CardTitle>All Documentation</CardTitle>
              </div>
              <CardDescription>Browse all available documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/docs/user-guide" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    User Guide
                  </Button>
                </Link>
                <Link href="/docs/faq" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    FAQ
                  </Button>
                </Link>
                <Link href="/docs/troubleshooting" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Troubleshooting
                  </Button>
                </Link>
                <Link href="/docs/admin-guide" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Admin Guide
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/docs/user-guide#getting-started"
                  className="block text-liberian-blue hover:underline"
                >
                  Creating an Account
                </Link>
                <Link
                  href="/docs/user-guide#using-the-learning-path"
                  className="block text-liberian-blue hover:underline"
                >
                  Understanding the Learning Path
                </Link>
                <Link
                  href="/docs/user-guide#completing-lessons"
                  className="block text-liberian-blue hover:underline"
                >
                  Completing Lessons
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/docs/faq#account--sign-in"
                  className="block text-liberian-blue hover:underline"
                >
                  Account & Sign In
                </Link>
                <Link
                  href="/docs/faq#learning--lessons"
                  className="block text-liberian-blue hover:underline"
                >
                  Learning & Lessons
                </Link>
                <Link
                  href="/docs/faq#xp-hearts--achievements"
                  className="block text-liberian-blue hover:underline"
                >
                  XP, Hearts & Achievements
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/docs/troubleshooting#quick-fixes"
                  className="block text-liberian-blue hover:underline"
                >
                  Quick Fixes
                </Link>
                <Link
                  href="/docs/troubleshooting#common-issues"
                  className="block text-liberian-blue hover:underline"
                >
                  Common Issues
                </Link>
                <Link
                  href="/docs/troubleshooting#when-to-contact-support"
                  className="block text-liberian-blue hover:underline"
                >
                  Contact Support
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/settings/profile" className="block text-liberian-blue hover:underline">
                  Profile Settings
                </Link>
                <Link
                  href="/settings/preferences"
                  className="block text-liberian-blue hover:underline"
                >
                  Preferences
                </Link>
                <Link href="/settings/courses" className="block text-liberian-blue hover:underline">
                  Course Management
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Brand Guidelines (Kola) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Brand Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Logo</CardTitle>
                <CardDescription>Official Kola logo and wordmark</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src="/Assets%20for%20UI/Kola%20design%20assets/kola%20logo.png"
                    alt="Kola logo"
                    width={320}
                    height={320}
                    className="max-w-xs w-full h-auto rounded-md shadow-sm"
                  />
                  <p className="text-sm text-foreground-light text-center">
                    Use the full-color logo on light backgrounds. For dark backgrounds use the
                    reversed or single-color mark from the design assets folder.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mascot & Assets</CardTitle>
                <CardDescription>Primary mascot and design elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Image
                      src="/Assets%20for%20UI/Kola%20design%20assets/5.png"
                      alt="Kola mascot 1"
                      width={160}
                      height={160}
                      className="object-contain rounded"
                    />
                    <Image
                      src="/Assets%20for%20UI/Kola%20design%20assets/9.png"
                      alt="Kola mascot 2"
                      width={160}
                      height={160}
                      className="object-contain rounded"
                    />
                  </div>
                  <p className="text-sm text-foreground-light text-center">
                    Mascot artwork and framed badges are included in the design assets. Prefer
                    vector/source exports for print and high-DPI use.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Assets Folder</CardTitle>
                <CardDescription>
                  All brand assets are available in the public folder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-light mb-3">
                  Path: <span className="font-mono">/public/Assets for UI/Kola design assets</span>
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="/Assets%20for%20UI/Kola%20design%20assets"
                    className="text-liberian-blue hover:underline"
                  >
                    Open Design Assets
                  </a>
                  <span className="text-xs text-foreground-light">
                    (Contains logo, mascot PNGs, and video files)
                  </span>
                  <div className="ml-4 flex items-center gap-2">
                    <a
                      href="/brand-assets/Kola-brand-one-pager.pdf"
                      className="text-liberian-blue hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline">Download Brand PDF</Button>
                    </a>
                    <a
                      href="/brand-assets/kola-assets.zip"
                      className="text-liberian-blue hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline">Download Assets ZIP</Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Primary brand colors used across Kola UI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-md shadow-inner"
                    style={{ backgroundColor: "#58A8A8" }}
                  />
                  <div>
                    <div className="font-medium">Primary Teal</div>
                    <div className="text-xs text-foreground-light">#58A8A8</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-md shadow-inner"
                    style={{ backgroundColor: "#884828" }}
                  />
                  <div>
                    <div className="font-medium">Warm Bronze</div>
                    <div className="text-xs text-foreground-light">#884828</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-md shadow-inner"
                    style={{ backgroundColor: "#48A898" }}
                  />
                  <div>
                    <div className="font-medium">Accent Green</div>
                    <div className="text-xs text-foreground-light">#48A898</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-md shadow-inner"
                    style={{ backgroundColor: "#183818" }}
                  />
                  <div>
                    <div className="font-medium">Deep Leaf</div>
                    <div className="text-xs text-foreground-light">#183818</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
