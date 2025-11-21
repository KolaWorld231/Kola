import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-foreground-light">
              Learn Liberian languages through interactive lessons, stories, and exercises.
            </p>
          </div>

          {/* Learn */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Learn</h3>
            <ul className="space-y-2 text-sm text-foreground-light">
              <li>
                <Link href="/learn" className="hover:text-primary transition-colors">
                  Languages
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-primary transition-colors">
                  Practice Mode
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-foreground-light">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-primary transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <ul className="space-y-2 text-sm text-foreground-light">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Volo
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-foreground-light">
          <p>&copy; {new Date().getFullYear()} Volo. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for preserving Liberian languages 🇱🇷</p>
        </div>
      </div>
    </footer>
  );
}






