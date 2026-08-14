"use client";

import {
  BarChart3,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
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
import { isLocalAuth, useAuthActions, useAuthUser } from "@/lib/auth/client";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, isLoaded } = useAuthUser();
  const { signOut, openUserProfile } = useAuthActions();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 max-w-screen-2xl items-center px-6 mx-auto">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 px-0 md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2 lg:mr-8 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-primary text-primary-foreground transition-colors group-hover:bg-primary/85">
            <FileText className="h-4 w-4" />
          </div>
          <span className="hidden font-display font-semibold text-lg sm:inline-block text-enhanced tracking-tight">
            Documind
          </span>
        </Link>

        {/* Navigation — folder-tab style: underline on hover/active, no pill backgrounds */}
        <nav className="flex items-center gap-1 text-sm lg:gap-2">
          <Link
            href="/dashboard"
            className="hidden md:flex items-center space-x-2 px-3 py-2 border-b-2 border-transparent hover:border-ledger text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/chat"
            className="hidden md:flex items-center space-x-2 px-3 py-2 border-b-2 border-transparent hover:border-ledger text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </Link>
          <Link
            href="/graph"
            className="hidden md:flex items-center space-x-2 px-3 py-2 border-b-2 border-transparent hover:border-ledger text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Graph</span>
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
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
                        src={user.imageUrl ?? undefined}
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
                      <p className="catalog-number leading-none">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4 icon-blue" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/chat" className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 icon-green" />
                      Chat
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/graph" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4 icon-purple" />
                      Knowledge Graph
                    </Link>
                  </DropdownMenuItem>
                  {!isLocalAuth && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => openUserProfile()}
                      >
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        Manage Account
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => signOut()}
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
