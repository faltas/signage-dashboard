"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus } from "lucide-react";
import { useLanguage } from "@/app/language-provider";
import TimelineItem from "./TimelineItem";

export default function Timeline({ items, playerIndex, onDragEnd, removeItem }) {
  const { t } = useLanguage();

  return (
    <div className="lg:col-span-7 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> {t("orchestration_timeline")}
        </h3>
        <Badge
          variant="outline"
          className="border-border text-[10px] px-3"
        >
          {t("drag_reorder")}
        </Badge>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="playlist">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(providedDrag) => (
                    <TimelineItem
                      item={item}
                      index={index}
                      isActive={playerIndex === index}
                      removeItem={removeItem}
                      provided={providedDrag}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {items.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-muted-foreground gap-3 bg-muted/10">
                  <Plus className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-medium">
                    {t("timeline_empty")}
                  </p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
