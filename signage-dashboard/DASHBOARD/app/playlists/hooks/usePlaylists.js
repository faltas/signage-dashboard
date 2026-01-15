"use client";

import { useSupabase } from "@/app/providers";
import { useState } from "react";

export function usePlaylists() {
  const supabase = useSupabase();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPlaylists() {
    setLoading(true);
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPlaylists(data || []);
    setLoading(false);
  }

  return { playlists, loading, loadPlaylists };
}
