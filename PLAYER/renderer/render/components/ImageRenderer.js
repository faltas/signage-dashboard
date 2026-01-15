export function ImageRenderer(localPath, fit) {
  return `<img src="file://${localPath}" style="width:100%; height:100%; object-fit:${fit};" />`;
}