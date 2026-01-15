"use client";

import { Search, Layout, Folder as FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/app/language-provider";

export default function PickerSidebar({
  pickerFolders,
  pickerFolderId,
  setPickerFolderId,
  pickerSearchQuery,
  setPickerSearchQuery,
}) {
  const { t } = useLanguage();

  return (
    <div className="hidden md:flex md:col-span-4 bg-muted/20 p-8 border-r border-border flex-col gap-6">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-foreground">
          {t("vault_picker")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("select_nodes_inject")}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("search_assets")}
          className="pl-12 bg-card border-border h-10 rounded-md"
          value={pickerSearchQuery}
          onChange={(e) => setPickerSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h4 className="text-xs font-semibold text-muted-foreground ml-1">
          {t("directories")}
        </h4>

        <Button
          variant={pickerFolderId === null ? "secondary" : "ghost"}
          className={`w-full justify-start h-10 rounded-md text-sm transition-all ${
            pickerFolderId === null ? "" : "hover:bg-muted"
          }`}
          onClick={() => setPickerFolderId(null)}
        >
          <Layout className="w-4 h-4 mr-3 text-primary" /> All Assets
        </Button>

        {pickerFolders.map((f) => (
          <Button
            key={f.id}
            variant={pickerFolderId === f.id ? "secondary" : "ghost"}
            className={`w-full justify-start h-10 rounded-md text-sm transition-all ${
              pickerFolderId === f.id ? "" : "hover:bg-muted"
            }`}
            onClick={() => setPickerFolderId(f.id)}
          >
            <FolderIcon className="w-4 h-4 mr-3 text-primary" /> {f.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
