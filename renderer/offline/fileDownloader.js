export async function downloadFile(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  } catch (err) {
    console.error("Errore download file:", err);
    return null;
  }
}
