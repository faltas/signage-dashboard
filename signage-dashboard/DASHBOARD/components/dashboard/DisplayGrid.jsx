import { DisplayCard } from "@/app/displays/components/DisplayCard";

export function DisplayGrid({ displays, columns, SavePlayerName }) {
  const gridCols = {
    3: "lg:grid-cols-3",
    5: "lg:grid-cols-5"
  }[columns] || "lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4 md:gap-8`}>
      {displays.map((d) => (
        <DisplayCard key={d.id} d={d} SavePlayerName={SavePlayerName}/>
      ))}
    </div>
  );
}
