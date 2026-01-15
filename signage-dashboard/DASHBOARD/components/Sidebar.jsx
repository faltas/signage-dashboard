"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { useLanguage } from "@/app/language-provider";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Monitor, 
  PlayCircle, 
  HardDrive, 
  Settings, 
  LogOut,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Cpu,
  Zap,
  Globe,
  LayoutGrid
} from "lucide-react";

export function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const { lang, switchLanguage, t } = useLanguage();

  const menuItems = [
    { href: "/displays", label: t('fleet_nodes'), icon: Cpu, badge: "LIVE" },
    { href: "/walls", label: t('video_walls') || 'Video Walls', icon: LayoutGrid },
    { href: "/playlists", label: t('sequences'), icon: PlayCircle },
    { href: "/contents", label: t('media_vault'), icon: HardDrive },
    { href: "/settings", label: t('control_panel'), icon: Settings },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const MenuList = (
    <div className="flex flex-col gap-3">
      {menuItems.map((item) => {
        const active = pathname?.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen && setOpen(false)}
            className={`
              flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase
              transition-all duration-500 group relative overflow-hidden
              ${
                active
                  ? "bg-primary text-white shadow-[0_10px_30px_-10px_oklch(0.65_0.25_260_/_0.5)] scale-105 z-10"
                  : "text-muted-foreground hover:bg-black/15 hover:text-white"
              }
            `}
          >
            <div className="flex items-center gap-4 relative z-10">
              <Icon className={`w-5 h-5 ${active ? "text-white" : "group-hover:text-primary transition-colors duration-500"}`} />
              {item.label}
            </div>
            {item.badge && !active && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[8px] animate-pulse relative z-10">
                {item.badge}
              </span>
            )}
            {active && <ChevronRight className="w-4 h-4 relative z-10" />}
            {active && <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary-foreground/20 opacity-50" />}
          </Link>
        );
      })}
      
      <div className="mt-4 px-5 space-y-3">
        <p className="text-[8px] font-black tracking-widest text-muted-foreground uppercase">{t('language')}</p>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-3 rounded-lg text-[10px] font-black ${lang === 'it' ? 'bg-primary text-white' : 'hover:bg-black/15'}`}
            onClick={() => switchLanguage('it')}
          >
            ITA
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-3 rounded-lg text-[10px] font-black ${lang === 'en' ? 'bg-primary text-white' : 'hover:bg-black/15'}`}
            onClick={() => switchLanguage('en')}
          >
            ENG
          </Button>
        </div>
      </div>
    </div>
  );

  const Logo = (
    <div className="flex items-center gap-4 px-2">
      <div className="relative group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500">
          <Zap className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <div className="text-lg font-black tracking-tighter text-foreground">SIGNAGE<span className="text-primary">CLOUD</span></div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-black">{t('secure_os')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE SIDEBAR */}
      {setOpen && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-[85vw] p-0 bg-sidebar border-r border-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Access system nodes, sequences, and settings.</SheetDescription>
            <div className="flex flex-col h-full p-6">
              <div className="mb-10">{Logo}</div>
              <div className="flex-1 overflow-y-auto">{MenuList}</div>
              <div className="pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full h-12 justify-start text-rose-500 hover:bg-rose-500/10 font-black text-[10px] tracking-[0.2em] rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  {t('terminate_session')}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 h-screen flex-col border-r border-border bg-sidebar p-8 fixed left-0 top-0 z-50">
        <div className="mb-12">{Logo}</div>
        <div className="flex-1 overflow-y-auto">{MenuList}</div>
        <div className="pt-6 border-t border-border">
          <Button
            variant="ghost"
            className="w-full h-12 justify-start text-muted-foreground/60 hover:bg-rose-500/10 hover:text-rose-500 font-black text-[10px] tracking-[0.2em] rounded-xl transition-all group"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
            {t('logout_system')}
          </Button>
        </div>
      </aside>
    </>
  );
}