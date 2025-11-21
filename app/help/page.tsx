"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, MessageCircle, AlertCircle, FileText, Settings, Users } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Help & Support</h1>
          <p className="text-lg text-foreground-light">
            Find answers, get help, and learn how to use Volo
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
                Complete guide to using Volo, from getting started to advanced features
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
              <CardDescription>
                Answers to frequently asked questions about Volo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/faq">
                <Button variant="outline" className="w-full">View FAQ</Button>
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
              <CardDescription>
                Solutions to common issues and problems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/troubleshooting">
                <Button variant="outline" className="w-full">Get Help</Button>
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
              <CardDescription>
                Guide for administrators managing the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/admin-guide">
                <Button variant="outline" className="w-full">Admin Docs</Button>
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
              <CardDescription>
                Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button variant="outline" className="w-full">Contact Us</Button>
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
              <CardDescription>
                Browse all available documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/docs/user-guide" className="block">
                  <Button variant="ghost" className="w-full justify-start">User Guide</Button>
                </Link>
                <Link href="/docs/faq" className="block">
                  <Button variant="ghost" className="w-full justify-start">FAQ</Button>
                </Link>
                <Link href="/docs/troubleshooting" className="block">
                  <Button variant="ghost" className="w-full justify-start">Troubleshooting</Button>
                </Link>
                <Link href="/docs/admin-guide" className="block">
                  <Button variant="ghost" className="w-full justify-start">Admin Guide</Button>
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
                <Link href="/docs/user-guide#getting-started" className="block text-liberian-blue hover:underline">
                  Creating an Account
                </Link>
                <Link href="/docs/user-guide#using-the-learning-path" className="block text-liberian-blue hover:underline">
                  Understanding the Learning Path
                </Link>
                <Link href="/docs/user-guide#completing-lessons" className="block text-liberian-blue hover:underline">
                  Completing Lessons
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/docs/faq#account--sign-in" className="block text-liberian-blue hover:underline">
                  Account & Sign In
                </Link>
                <Link href="/docs/faq#learning--lessons" className="block text-liberian-blue hover:underline">
                  Learning & Lessons
                </Link>
                <Link href="/docs/faq#xp-hearts--achievements" className="block text-liberian-blue hover:underline">
                  XP, Hearts & Achievements
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/docs/troubleshooting#quick-fixes" className="block text-liberian-blue hover:underline">
                  Quick Fixes
                </Link>
                <Link href="/docs/troubleshooting#common-issues" className="block text-liberian-blue hover:underline">
                  Common Issues
                </Link>
                <Link href="/docs/troubleshooting#when-to-contact-support" className="block text-liberian-blue hover:underline">
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
                <Link href="/settings/preferences" className="block text-liberian-blue hover:underline">
                  Preferences
                </Link>
                <Link href="/settings/courses" className="block text-liberian-blue hover:underline">
                  Course Management
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

