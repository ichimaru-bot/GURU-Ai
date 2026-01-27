import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

/**
 * Upload image to telegra.ph
 * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * @param {Buffer|string} input Image Buffer or Image URL
 * @return {Promise<string>} telegra.ph URL
 */
async function uploadToTelegraph(input) {
  let buffer = input;

  // If input is a URL string, fetch it
  if (typeof input === 'string') {
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: HTTP ${response.status}`);
    }
    buffer = await response.arrayBuffer();
    buffer = Buffer.from(buffer);
  }

  // Get file type info
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType) {
    throw new Error('Unable to detect file type');
  }

  const { ext, mime } = fileType;

  // Check if file type is supported
  const supportedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!supportedMimes.includes(mime)) {
    throw new Error(`Unsupported mime type: ${mime}. Supported: ${supportedMimes.join(', ')}`);
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mime });
  form.append('file', blob, `tmp.${ext}`);

  // Upload to telegra.ph
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form,
  });

  const img = await res.json();
  if (img.error) {
    throw new Error(`Telegraph error: ${img.error}`);
  }

  return 'https://telegra.ph' + img[0].src;
}

/**
 * Convert image buffer to JPEG format
 * Supports WebP, PNG, and other formats that sharp can read
 * @param {Buffer} buffer Image buffer to convert
 * @param {number} quality JPEG quality (1-100, default: 80)
 * @return {Promise<Buffer>} JPEG image buffer
 */
async function convertToJpg(buffer, quality = 80) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
  }

  try {
    const jpegBuffer = await sharp(buffer)
      .jpeg({ quality, progressive: true })
      .toBuffer();
    return jpegBuffer;
  } catch (error) {
    throw new Error(`Failed to convert to JPEG: ${error.message}`);
  }
}

/**
 * Detect mime type and convert to specified format
 * @param {Buffer} buffer Image buffer
 * @param {string} format Output format (jpeg, png, webp, etc.)
 * @return {Promise<Buffer>} Converted image buffer
 */
async function convertImage(buffer, format = 'jpeg') {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
  }

  try {
    const converted = await sharp(buffer)
      [format]({ quality: 80, progressive: true })
      .toBuffer();
    return converted;
  } catch (error) {
    throw new Error(`Failed to convert to ${format}: ${error.message}`);
  }
}

// We are exporting this as an object.
const helper = {
  uploadToTelegraph,
  convertToJpg,
  convertImage,
};

export default helper;
export { uploadToTelegraph, convertToJpg, convertImage };
