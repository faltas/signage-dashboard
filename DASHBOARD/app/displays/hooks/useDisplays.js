import { useState, useEffect } from "react";
import { useSupabase } from "@/app/providers";

export function useDisplays() {
  const supabase = useSupabase();
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("displays")
      .select(`
        id,
        name,
        status,
        last_seen_at,
        pairing_code,
        screen_count,
        wall_id,
        projection_mode,
        walls:wall_id ( id, name, type, rows, columns ),
        display_screens ( id, windowindex, width, height, is_primary, resolution )
      `)
      .not("user_id", "is", null)
      .order("created_at", { ascending: false });

    setDisplays(error ? [] : data || []);
    setLoading(false);
  }

  async function SavePlayerName(id, name) {
    const { error } = await supabase
      .from("displays")
      .update({ name })
      .eq("id", id);

    if (error) {
      console.error("Errore aggiornamento nome:", error);
      return false;
    }

    // Aggiorna solo il record modificato
    setDisplays(prev =>
      prev.map(d => (d.id === id ? { ...d, name } : d))
    );

    return true;
  }

  useEffect(() => {
    load();

    const channel = supabase.channel("displays-realtime");

    // UPDATE → aggiorna solo quel display
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "displays" },
      (payload) => {
        setDisplays(prev =>
          prev.map(d => (d.id === payload.new.id ? payload.new : d))
        );
      }
    );

    // INSERT → aggiungi solo il nuovo display
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "displays" },
      (payload) => {
        setDisplays(prev => [payload.new, ...prev]);
      }
    );

    // DELETE → rimuovi solo quello eliminato
    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "displays" },
      (payload) => {
        setDisplays(prev => prev.filter(d => d.id !== payload.old.id));
      }
    );

    channel.subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return { displays, loading, loadDisplays: load, SavePlayerName };
}
