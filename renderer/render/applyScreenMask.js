export function applyScreenMask(screen) {
  const canvas = window.VirtualCanvas;
  if (!canvas) return;

  const mask = document.createElement("div");
  mask.className = "screen-mask";

  mask.style.position = "absolute";
  mask.style.top = screen.y + "px";
  mask.style.left = screen.x + "px";
  mask.style.width = screen.width + "px";
  mask.style.height = screen.height + "px";
  mask.style.overflow = "hidden";

  mask.appendChild(canvas);

  document.body.appendChild(mask);
}
