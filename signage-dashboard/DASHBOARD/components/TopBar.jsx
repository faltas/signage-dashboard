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

import { Menu, Bell } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full glass-premium border-b border-border md:px-8 py-4 px-4">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl hover:bg-primary/10"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground">{title}</h1>
            <p className="hidden md:block text-[10px] font-black text-muted-foreground uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-4 bg-background/50 px-4 py-2 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-foreground tracking-widest uppercase">Node Sync: Active</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10">
            <Bell className="w-5 h-5 text-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-white font-bold text-xs">{letter}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-premium border-border">
              <DropdownMenuLabel className="font-black text-[10px] tracking-widest uppercase text-muted-foreground">System Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-bold text-sm" onClick={handleLogout}>LOGOUT SESSION</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
