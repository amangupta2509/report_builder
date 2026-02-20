// components/header-with-auth.tsx
"use client";

import { useAuth } from "@/components/auth-provider";
import { LogOut, User, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function HeaderWithAuth() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="fixed top-0 right-0 z-50 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-9 w-9 cursor-pointer shadow-md hover:shadow-lg transition">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Account Information</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="px-2 py-2">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 uppercase">
                {user.role}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
