"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/app/language-provider";
import PickerSidebar from "./PickerSidebar";
import PickerGrid from "./PickerGrid";

export default function PickerModal({
  open,
  onClose,
  pickerFolders,
  pickerFolderId,
  setPickerFolderId,
  pickerContents,
  pickerSearchQuery,
  setPickerSearchQuery,
  setModalContent,
}) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border border-border/40 shadow-lg rounded-xl p-0 overflow-hidden max-w-[95vw]">
        <DialogTitle className="sr-only">{t("vault_picker")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("select_nodes_inject")}
        </DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-12 h-[85vh] md:h-[600px]">
          <PickerSidebar
            pickerFolders={pickerFolders}
            pickerFolderId={pickerFolderId}
            setPickerFolderId={setPickerFolderId}
            pickerSearchQuery={pickerSearchQuery}
            setPickerSearchQuery={setPickerSearchQuery}
          />

          <PickerGrid
            pickerFolders={pickerFolders}
            pickerFolderId={pickerFolderId}
            pickerContents={pickerContents}
            pickerSearchQuery={pickerSearchQuery}
            setPickerSearchQuery={setPickerSearchQuery}
            setModalContent={setModalContent}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
