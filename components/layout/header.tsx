"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-6 mx-auto">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6 group">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
            <FileText className="h-6 w-6 icon-blue" />
          </div>
          <span className="hidden font-bold sm:inline-block text-enhanced group-hover:text-blue-700 transition-colors">Documind</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-700 font-semibold"
          >
            <BarChart3 className="h-4 w-4 text-gray-600 hover:text-blue-600" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/chat"
            className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-gray-700 hover:text-green-700 font-semibold"
          >
            <MessageSquare className="h-4 w-4 text-gray-600 hover:text-green-600" />
            <span>Chat</span>
          </Link>
          <Link
            href="/graph"
            className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 text-gray-700 hover:text-purple-700 font-semibold"
          >
            <Search className="h-4 w-4 text-gray-600 hover:text-purple-600" />
            <span>Graph</span>
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Search */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="relative h-8 w-full justify-start rounded-lg bg-white text-sm font-medium text-gray-600 border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 shadow-sm sm:pr-12 md:w-40 lg:w-64 transition-all duration-300"
            >
              <Search className="mr-2 h-4 w-4 text-gray-500 hover:text-blue-600" />
              Search documents...
            </Button>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-2">
            {isLoaded && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user.firstName || ""}
                      />
                      <AvatarFallback>
                        {user.firstName?.charAt(0) ||
                          user.emailAddresses[0]?.emailAddress?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-enhanced">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-enhanced">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center hover:bg-blue-50 transition-colors">
                      <BarChart3 className="mr-2 h-4 w-4 icon-blue" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/chat" className="flex items-center hover:bg-green-50 transition-colors">
                      <MessageSquare className="mr-2 h-4 w-4 icon-green" />
                      Chat
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/graph" className="flex items-center hover:bg-purple-50 transition-colors">
                      <Search className="mr-2 h-4 w-4 icon-purple" />
                      Knowledge Graph
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => openUserProfile()}
                  >
                    <Settings className="mr-2 h-4 w-4 text-gray-600" />
                    Manage Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-600 focus:bg-red-50 hover:bg-red-50 transition-colors dark:focus:bg-red-950"
                    onClick={() => signOut({ redirectUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
