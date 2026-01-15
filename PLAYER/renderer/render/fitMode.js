// renderer/render/fitMode.js
export function getFitMode(type, contentRel, projectionMode) {
  if (projectionMode && projectionMode !== "auto") {
    return projectionMode;
  }

  const displayRatio = window.innerWidth / window.innerHeight;
  let contentRatio = null;

  if (contentRel?.width && contentRel?.height) {
    contentRatio = contentRel.width / contentRel.height;
  }

  if (!contentRatio) {
    if (type === "video") return "contain";
    return "cover";
  }

  const diff = Math.abs(displayRatio - contentRatio);
  if (diff < 0.1) return "cover";

  return "contain";
}
