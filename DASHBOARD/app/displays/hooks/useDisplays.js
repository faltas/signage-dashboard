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
        display_screens ( id, screen_index, width, height, is_primary, resolution )
      `)
      .not("user_id", "is", null)
      .order("created_at", { ascending: false });

    setDisplays(error ? [] : data || []);
    setLoading(false);
	
  }
  
  async function SavePlayerName(id, name) {
	  
	  const {error} = await supabase
		.from("displays")
		.update({name: name})
		.eq("id", id);
		
	  if (error) 
		console.error("Errore aggiornamento nome:", error); return false;
		
	  load(); 
	  
	  return true;
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel("displays-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "displays" },
        load
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return { displays, loading, loadDisplays: load, SavePlayerName };
}
