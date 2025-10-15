// src/components/layout/Header.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Crown, User } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Link } from "wouter"; // 👈 import Link from wouter

interface HeaderProps {
  subscriptionStatus?: {
    subscribed: boolean;
  };
}

export function Header({ subscriptionStatus }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section — Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Heartsync</h1>
          </div>

          {/* Right Section — Notifications, Badge, User */}
          <div className="flex items-center space-x-4">
            {/* 🔔 Live Notifications */}
            <NotificationBell />

            {/* 👑 Premium Badge */}
            {subscriptionStatus?.subscribed && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}

            {/* 👤 Profile Button — Navigates to /profile */}
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="p-2">
                <User className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
