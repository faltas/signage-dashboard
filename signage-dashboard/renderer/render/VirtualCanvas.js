export function createVirtualCanvas(wallConfig) {
  const { pixel_width, pixel_height } = wallConfig;

  const canvas = document.createElement("div");
  canvas.id = "virtual-canvas";

  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = pixel_width + "px";
  canvas.style.height = pixel_height + "px";
  canvas.style.transformOrigin = "top left";
  canvas.style.overflow = "hidden";
  setTimeout(scaleVirtualCanvas, 50);

  return canvas;
}

export function scaleVirtualCanvas() {
  const canvas = document.getElementById("virtual-canvas");
  if (!canvas) return;

  const scaleX = window.innerWidth / canvas.offsetWidth;
  const scaleY = window.innerHeight / canvas.offsetHeight;
  const scale = Math.min(scaleX, scaleY);

  canvas.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", scaleVirtualCanvas);
