"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Menu, Bell, Search, Settings2, Command, LogOut } from "lucide-react";

export function TopBar({ title, subtitle, onMenuClick }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    loadUser();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const letter =
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 py-3">
      <div className="flex items-center justify-between mx-auto w-full">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* CMD-K */}
          <div className="hidden xl:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border/50">
            <span className="text-xs text-muted-foreground">Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>

          {/* SEARCH + BELL */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
            </Button>
          </div>

          {/* DIVIDER */}
          <div className="h-6 w-px bg-border hidden sm:block mx-2" />

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 flex items-center gap-2 px-2 hover:bg-muted"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {letter}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.name || "Root User"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <DropdownMenuLabel>
                <p className="text-xs font-normal text-muted-foreground">
                  Signed in as
                </p>
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="cursor-pointer">
                <Settings2 className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
