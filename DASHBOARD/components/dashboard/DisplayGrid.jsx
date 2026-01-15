import { DisplayCard } from "@/app/displays/components/DisplayCard";

export function DisplayGrid({ displays, columns, SavePlayerName }) {
  const gridCols = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
  }[columns] || "lg:grid-cols-2";

  return (
    <div
      className={`
        grid 
        grid-cols-1 
        sm:grid-cols-1 
        md:grid-cols-2 
        ${gridCols}
        gap-4 
        md:gap-6 
        xl:gap-8
      `}
    >
      {displays.map((d) => (
        <DisplayCard 
          key={d.id} 
          d={d} 
          SavePlayerName={SavePlayerName} 
        />
      ))}
    </div>
  );
}
