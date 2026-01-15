export function VideoRenderer(localPath, fit) {
  return `<video autoplay muted loop style="width:100%; height:100%; object-fit:${fit};"><source src="file://${localPath}" /></video>`;
}