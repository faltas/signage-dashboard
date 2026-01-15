"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/app/language-provider";

export default function SchedulingPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = useSupabase();
  const { t } = useLanguage();

  const [display, setDisplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeDays, setActiveDays] = useState(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  const [timeSlots, setTimeSlots] = useState([{ start: "08:00", end: "20:00" }]);

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  useEffect(() => {
    async function loadDisplay() {
      const { data } = await supabase.from("displays").select("*").eq("id", id).single();
      setDisplay(data);
      if (data?.scheduling) {
        setActiveDays(data.scheduling.activeDays || days);
        setTimeSlots(data.scheduling.timeSlots || [{ start: "08:00", end: "20:00" }]);
      }
      setLoading(false);
    }
    loadDisplay();
  }, [id]);

  const toggleDay = (day) => {
    setActiveDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addSlot = () => {
    setTimeSlots([...timeSlots, { start: "09:00", end: "18:00" }]);
  };

  const removeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const saveScheduling = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("displays")
        .update({ 
          scheduling: { activeDays, timeSlots } 
        })
        .eq("id", id);
      
      if (error) throw error;
      alert("Scheduling salvato con successo!");
    } catch (err) {
      alert("Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar title={t('advanced_scheduling')} subtitle={display?.name} onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 px-8 py-10 space-y-12 max-w-[1200px] mx-auto w-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-10">
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> {t('back')}
                </Button>
                <h2 className="text-5xl font-black tracking-tighter text-foreground">{t('advanced_scheduling')}</h2>
                <p className="text-muted-foreground font-medium text-lg">{t('scheduling_desc')}</p>
              </div>
              <Button onClick={saveScheduling} disabled={saving} className="btn-premium h-16 px-10 rounded-2xl font-black shadow-xl">
                {saving ? t('syncing') : <><Save className="w-6 h-6 mr-2" /> {t('save_scheduling')}</>}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* GIORNI ATTIVI */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Calendar className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black tracking-tight">{t('active_days')}</h3>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {days.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`h-20 flex flex-col items-center justify-center rounded-2xl font-black transition-all border-2 ${
                        activeDays.includes(day) 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-card/30 border-white/5 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="text-sm">{t(day)}</span>
                      {activeDays.includes(day) && <CheckCircle2 className="w-4 h-4 mt-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* FASCE ORARIE */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Clock className="w-6 h-6" /></div>
                    <h3 className="text-2xl font-black tracking-tight">{t('time_slots')}</h3>
                  </div>
                  <Button variant="ghost" onClick={addSlot} className="text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5">
                    <Plus className="w-4 h-4 mr-2" /> {t('add_slot')}
                  </Button>
                </div>

                <div className="space-y-4">
                  {timeSlots.map((slot, idx) => (
                    <Card key={idx} className="glass-premium p-6 border-none flex items-center gap-6 relative group animate-in slide-in-from-right-4">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start</label>
                          <Input type="time" value={slot.start} onChange={(e) => updateSlot(idx, 'start', e.target.value)} className="bg-black/20 border-white/5 h-12 rounded-xl font-black text-lg" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End</label>
                          <Input type="time" value={slot.end} onChange={(e) => updateSlot(idx, 'end', e.target.value)} className="bg-black/20 border-white/5 h-12 rounded-xl font-black text-lg" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeSlot(idx)} className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </Card>
                  ))}
                  {timeSlots.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] text-muted-foreground/30">
                       <AlertCircle className="w-12 h-12 mb-4" />
                       <p className="font-black uppercase tracking-widest text-[10px]">Nessuna fascia oraria impostata</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
