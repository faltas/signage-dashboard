"use client";

import { useSupabase } from "@/app/providers";
import { useState, useEffect } from "react";

export function useMedia() {
  const supabase = useSupabase();
  const [contents, setContents] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFolders() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("content_folders")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });
    setFolders(data || []);
  }

  async function loadContents(folderId) {
    if (!folderId) {
      setContents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("contents")
      .select("*")
      .eq("folder_id", folderId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setContents(data || []);
    setLoading(false);
  }

  return { folders, contents, loading, loadFolders, loadContents };
}
