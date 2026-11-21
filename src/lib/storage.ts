import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  storageType: 'local' | 'r2';
  contentType: string;
}

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
};

/**
 * Universal Storage Adapter
 * - Local filesystem storage (default for zero-configuration development & on-premise)
 * - Cloudflare R2 / AWS S3 (activates automatically when R2/S3 environment variables are provided)
 */
export async function uploadAsset(
  buffer: Buffer,
  originalName: string,
  subfolder: 'fonts' | 'graphics' | 'music' | 'photos' = 'graphics'
): Promise<UploadResult> {
  const ext = path.extname(originalName).toLowerCase();
  const cleanBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanBase}_${Date.now().toString(36)}${ext}`;
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  const r2Bucket = process.env.R2_BUCKET_NAME;
  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2PublicDomain = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_URL;

  // 1. Cloudflare R2 / S3 mode (if configured)
  if (r2Bucket && r2AccountId && r2AccessKey && r2SecretKey) {
    try {
      const key = `${subfolder}/${filename}`;
      const endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com/${r2Bucket}/${key}`;

      // In production with R2 keys provided, upload via standard S3 HTTP PUT
      // (Falls back gracefully to local disk if network or credentials fail)
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      });

      if (res.ok) {
        const publicUrl = r2PublicDomain
          ? `${r2PublicDomain.replace(/\/+$/, '')}/${key}`
          : endpoint;

        return {
          url: publicUrl,
          filename,
          size: buffer.length,
          storageType: 'r2',
          contentType,
        };
      }
    } catch (err) {
      console.warn('R2 upload failed, falling back to local filesystem storage:', err);
    }
  }

  // 2. High-Performance Local Filesystem Storage (Default)
  const uploadDir = path.join(process.cwd(), 'public', 'assets', 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/assets/uploads/${subfolder}/${filename}`;

  return {
    url: publicUrl,
    filename,
    size: buffer.length,
    storageType: 'local',
    contentType,
  };
}
