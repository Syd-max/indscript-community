/**
 * Shared helpers: image -> WebP conversion.
 */

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal membaca gambar.')); };
    img.src = url;
  });
}

/**
 * Convert any raster image File to a WebP Blob (downscaled to maxDim).
 * SVG files are returned untouched (vector, already tiny).
 */
export async function convertImageToWebp(file, { maxDim = 1600, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
  if (file.type === 'image/svg+xml') return file;

  const img = await loadImage(file);
  let { naturalWidth: w, naturalHeight: h } = img;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  w = Math.round(w * scale);
  h = Math.round(h * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob || blob.type !== 'image/webp') throw new Error('Browser tidak mendukung konversi WebP.');
  return blob;
}

/** Convert image File to a WebP data URL (for storing inline, e.g. logos). */
export async function convertImageToWebpDataUrl(file, options = { maxDim: 512, quality: 0.85 }) {
  const blob = await convertImageToWebp(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(blob);
  });
}
