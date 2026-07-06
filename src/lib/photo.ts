// Photo intake pipeline.
//
// Two jobs, one canvas re-encode:
//   1. Size — a modern phone photo (3–10 MB) exceeds this device's storage
//      budget on its own. Downscaled to ~1600px JPEG it's ~200–400 KB.
//   2. Privacy — re-encoding through a canvas strips EXIF metadata (GPS
//      coordinates, device serials, timestamps). A photo of a valuable must
//      never carry the home's location with it.

const MAX_DIM = 1600
const QUALITY = 0.82

export async function compressImage(file: File): Promise<string> {
  const bitmap = await loadBitmap(file)
  try {
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unavailable')
    ctx.drawImage(bitmap, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', QUALITY)
  } finally {
    if ('close' in bitmap) (bitmap as ImageBitmap).close()
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file)
    } catch {
      /* fall through — some formats (e.g. older HEIC paths) need the <img> route */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not read that photo.'))
      img.src = url
    })
  } finally {
    // Revoke after decode; drawImage keeps the decoded bitmap alive.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}
