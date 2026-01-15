"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { useLanguage } from "@/app/language-provider";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  HardDrive, 
  Settings, 
  LogOut,
  ChevronRight,
  Cpu,
  Zap,
  LayoutGrid
} from "lucide-react";

export function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const { lang, switchLanguage, t } = useLanguage();

  const menuItems = [
    { href: "/displays", label: t('fleet_nodes'), icon: Cpu, badge: "LIVE" },
    { href: "/walls", label: t('video_walls'), icon: LayoutGrid },
    { href: "/playlists", label: t('sequences'), icon: PlayCircle },
    { href: "/contents", label: t('media_vault'), icon: HardDrive },
    { href: "/settings", label: t('control_panel'), icon: Settings },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const Logo = (
    <div className="flex items-center gap-3 px-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
        <Zap className="w-6 h-6" />
      </div>
      <div>
        <div className="text-lg font-bold tracking-tight text-foreground leading-none">
          Signage<span className="text-primary">Cloud</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 font-medium">
          Dashboard
        </div>
      </div>
    </div>
  );

  const MenuList = (
    <div className="flex flex-col gap-1">
      {menuItems.map((item) => {
        const active = pathname?.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen && setOpen(false)}
            className={`
              flex items-center justify-between rounded-lg py-2.5 px-4 transition-all duration-200 group
              ${active 
                ? "bg-primary text-primary-foreground shadow-sm font-medium" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"}
            `}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
              <span className="text-sm">{item.label}</span>
            </div>

            {item.badge && !active && (
              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-semibold">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {setOpen && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-[85vw] p-0 bg-white border-none shadow-xl">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigation</SheetDescription>

            <div className="flex flex-col h-full p-6">
              <div className="mb-10">{Logo}</div>
              <div className="flex-1 overflow-y-auto">{MenuList}</div>

              <div className="mt-auto pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:bg-rose-50 hover:text-rose-600 font-medium text-sm"
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

      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-border bg-background fixed left-0 top-0 z-50">
        <div className="mb-8 p-6 pb-0">{Logo}</div>

        <div className="flex-1 overflow-y-auto px-4 py-4">{MenuList}</div>

        <div className="p-4 mx-4 mb-2 bg-muted/50 rounded-lg flex gap-1">
          <Button 
            variant="ghost"
            size="sm"
            className={`flex-1 h-7 rounded text-xs font-medium transition-all ${lang === 'it' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => switchLanguage('it')}
          >
            ITA
          </Button>

          <Button 
            variant="ghost"
            size="sm"
            className={`flex-1 h-7 rounded text-xs font-medium transition-all ${lang === 'en' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => switchLanguage('en')}
          >
            ENG
          </Button>
        </div>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-rose-50 hover:text-rose-600 font-medium text-sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t('logout_system')}
          </Button>
        </div>
      </aside>
    </>
  );
}
