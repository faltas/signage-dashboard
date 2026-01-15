"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/app/providers";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useLanguage } from "@/app/language-provider";

import PlaylistHeader from "./components/PlaylistHeader";
import PlaylistStats from "./components/PlaylistStats";
import Timeline from "./components/Timeline";
import LiveSimulator from "./components/LiveSimulator";
import PickerModal from "./components/PickerModal";
import DurationDialog from "./components/DurationDialog";

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const supabase = useSupabase();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [ModalContent, setModalContent] = useState(null);

  const [pickerFolderId, setPickerFolderId] = useState(null);
  const [pickerFolders, setPickerFolders] = useState([]);
  const [pickerContents, setPickerContents] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearchQuery, setPickerSearchQuery] = useState("");

  const [durationSeconds, setDurationSeconds] = useState(10);
  const [expandToAllScreens, setExpandToAllScreens] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const [playerIndex, setPlayerIndex] = useState(0);
  const [playerProgress, setPlayerProgress] = useState(0);

  const playerRef = useRef({
    index: 0,
    progress: 0,
    items: [],
  });

  async function loadData() {
    setLoading(true);

    const { data: pl } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", id)
      .single();
    setPlaylist(pl);

    const { data: it } = await supabase
      .from("playlist_items")
      .select("*, contents(*)")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    setItems(it || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadPickerData(folderId) {
    setPickerLoading(true);

    const { data: f } = await supabase
      .from("content_folders")
      .select("*")
      .order("name", { ascending: true });
    setPickerFolders(f || []);

    const query = supabase
      .from("contents")
      .select("*")
      .order("created_at", { ascending: false });

    if (folderId) {
      query.eq("folder", folderId);
    }

    const { data: c } = await query;
    setPickerContents(c || []);
    setPickerLoading(false);
  }

  useEffect(() => {
    if (showAddModal) loadPickerData(pickerFolderId);
  }, [showAddModal, pickerFolderId]);

  async function confirmAddContentToPlaylist() {
    if (!ModalContent) return;

    await supabase.from("playlist_items").insert({
      playlist_id: id,
      content_id: ModalContent.id,
      position: items.length,
      duration_seconds: isSticky ? 0 : durationSeconds,
      expand_to_all_screens: expandToAllScreens,
      is_sticky: isSticky,
    });

    setModalContent(null);
    setExpandToAllScreens(false);
    setIsSticky(false);
    setDurationSeconds(10);
    setShowAddModal(false);
    loadData();
  }

  async function removeItem(itemId) {
    await supabase.from("playlist_items").delete().eq("id", itemId);
    loadData();
  }

  async function onDragEnd(result) {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((item, index) => ({
      ...item,
      position: index,
    }));

    setItems(updated);

    for (const item of updated) {
      await supabase
        .from("playlist_items")
        .update({ position: item.position })
        .eq("id", item.id);
    }
  }

  const totalDuration = items.reduce(
    (acc, i) => acc + (i.duration_seconds || 0),
    0
  );

  useEffect(() => {
    playerRef.current.items = items;
    playerRef.current.index = 0;
    playerRef.current.progress = 0;
  }, [items]);

  useEffect(() => {
    if (!items.length) return;

    const interval = setInterval(() => {
      const state = playerRef.current;
      const currentItem = state.items[state.index];

      if (currentItem?.is_sticky) {
        state.progress += 1;
        setPlayerProgress(state.progress);
        return;
      }

      const duration = currentItem?.duration_seconds || 10;
      state.progress += 1;

      if (state.progress >= duration) {
        state.index = (state.index + 1) % state.items.length;
        state.progress = 0;
      }

      setPlayerIndex(state.index);
      setPlayerProgress(state.progress);
    }, 1000);

    return () => clearInterval(interval);
  }, [items.length]);

  const filteredPickerContents = pickerContents.filter((c) =>
    c.name.toLowerCase().includes(pickerSearchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar
            title={playlist?.name || t("manage_sequence")}
            subtitle={t("system_admin_protocols")}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-10 space-y-12 max-w-[1600px] mx-auto w-full">
            <PlaylistHeader playlist={playlist} />

            <PlaylistStats
              items={items}
              totalDuration={totalDuration}
              onAdd={() => setShowAddModal(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <Timeline
                items={items}
                playerIndex={playerIndex}
                onDragEnd={onDragEnd}
                removeItem={removeItem}
              />

              <LiveSimulator
                items={items}
                playerIndex={playerIndex}
                playerProgress={playerProgress}
              />
            </div>
          </main>
        </div>

        <PickerModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          pickerFolders={pickerFolders}
          pickerFolderId={pickerFolderId}
          setPickerFolderId={setPickerFolderId}
          pickerContents={filteredPickerContents}
          pickerSearchQuery={pickerSearchQuery}
          setPickerSearchQuery={setPickerSearchQuery}
          setModalContent={setModalContent}
        />

        <DurationDialog
          ModalContent={ModalContent}
          setModalContent={setModalContent}
          durationSeconds={durationSeconds}
          setDurationSeconds={setDurationSeconds}
          isSticky={isSticky}
          setIsSticky={setIsSticky}
          expandToAllScreens={expandToAllScreens}
          setExpandToAllScreens={setExpandToAllScreens}
          confirmAddContentToPlaylist={confirmAddContentToPlaylist}
        />
      </div>
    </ProtectedRoute>
  );
}
