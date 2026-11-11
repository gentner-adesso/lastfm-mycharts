import { LastFmAlbum } from '../types/lastfm';

export interface RenderCollageOptions {
  albums: LastFmAlbum[];
  cols: number;
  rows: number;
  gap: number;
  showTitles: boolean;
  showPlaycounts: boolean;
  showRanks: boolean;
  style: 'classic' | 'minimal' | 'glass';
  targetWidth?: number; // defaults to 1800px
}

// Helper to safely load an image with CORS handling
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No image URL'));
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without anonymous or reject
      reject(new Error(`Failed to load ${url}`));
    };
    img.src = url;
  });
}

function getBestImageUrl(album: LastFmAlbum): string {
  if (!album.image || !album.image.length) return '';
  const preferred = ['mega', 'extralarge', 'large', 'medium', 'small'];
  for (const size of preferred) {
    const found = album.image.find((img) => img.size === size && img['#text']);
    if (found && found['#text']) return found['#text'];
  }
  return album.image[album.image.length - 1]?.['#text'] || '';
}

export async function renderCollageToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderCollageOptions
): Promise<void> {
  const {
    albums,
    cols,
    rows,
    gap = 8,
    showTitles = true,
    showPlaycounts = true,
    showRanks = true,
    targetWidth = 1800,
  } = options;

  const totalSlots = cols * rows;
  const selectedAlbums = albums.slice(0, totalSlots);

  // Compute tile dimensions
  const totalGapX = gap * (cols + 1);
  const totalGapY = gap * (rows + 1);
  const tileWidth = Math.floor((targetWidth - totalGapX) / cols);
  const tileHeight = tileWidth; // square tiles
  const targetHeight = tileHeight * rows + totalGapY;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Background
  ctx.fillStyle = '#050507';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Pre-load images in parallel
  const imagePromises = selectedAlbums.map(async (album) => {
    const url = getBestImageUrl(album);
    if (!url) return null;
    try {
      return await loadImage(url);
    } catch {
      return null;
    }
  });

  const loadedImages = await Promise.all(imagePromises);

  // Draw each album slot
  for (let i = 0; i < totalSlots; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = gap + c * (tileWidth + gap);
    const y = gap + r * (tileHeight + gap);

    const album = selectedAlbums[i];
    const img = loadedImages[i];

    ctx.save();
    // Rounded rect clip for each tile
    const radius = gap > 0 ? Math.min(16, tileWidth * 0.05) : 0;
    if (radius > 0) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + tileWidth - radius, y);
      ctx.quadraticCurveTo(x + tileWidth, y, x + tileWidth, y + radius);
      ctx.lineTo(x + tileWidth, y + tileHeight - radius);
      ctx.quadraticCurveTo(x + tileWidth, y + tileHeight, x + tileWidth - radius, y + tileHeight);
      ctx.lineTo(x + radius, y + tileHeight);
      ctx.quadraticCurveTo(x, y + tileHeight, x, y + tileHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.clip();
    }

    if (img) {
      ctx.drawImage(img, x, y, tileWidth, tileHeight);
    } else {
      // Elegant Fallback: Vinyl record gradient with typography
      const grad = ctx.createLinearGradient(x, y, x + tileWidth, y + tileHeight);
      grad.addColorStop(0, '#1c1e24');
      grad.addColorStop(0.5, '#252932');
      grad.addColorStop(1, '#15161a');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tileWidth, tileHeight);

      // Vinyl subtle rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 2;
      const centerX = x + tileWidth / 2;
      const centerY = y + tileHeight / 2;
      for (let ring = 20; ring < tileWidth / 2; ring += 25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (album) {
        // Fallback text
        ctx.fillStyle = '#f3f4f6';
        ctx.font = `bold ${Math.max(16, Math.floor(tileWidth * 0.065))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = wrapText(ctx, album.name, tileWidth * 0.85);
        const startY = centerY - (lines.length * 20) / 2;
        lines.forEach((line, idx) => {
          ctx.fillText(line, centerX, startY + idx * 24);
        });

        ctx.fillStyle = '#d51007';
        ctx.font = `600 ${Math.max(13, Math.floor(tileWidth * 0.048))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(album.artist.name, centerX, centerY + (lines.length * 20) / 2 + 20);
      }
    }

    // Overlay details
    if (album && (showTitles || showPlaycounts || showRanks)) {
      // Bottom Gradient for readability if titles are shown
      if (showTitles || showPlaycounts) {
        const overlayHeight = Math.floor(tileHeight * 0.38);
        const overlayGrad = ctx.createLinearGradient(
          x,
          y + tileHeight - overlayHeight,
          x,
          y + tileHeight
        );
        overlayGrad.addColorStop(0, 'rgba(5, 5, 7, 0)');
        overlayGrad.addColorStop(0.4, 'rgba(5, 5, 7, 0.85)');
        overlayGrad.addColorStop(1, 'rgba(5, 5, 7, 0.98)');
        ctx.fillStyle = overlayGrad;
        ctx.fillRect(x, y + tileHeight - overlayHeight, tileWidth, overlayHeight);

        const padX = Math.max(12, Math.floor(tileWidth * 0.05));
        const baseBottom = y + tileHeight - Math.max(10, Math.floor(tileWidth * 0.04));

        let currentY = baseBottom;

        if (showPlaycounts && album.playcount) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = '#ff1721';
          ctx.font = `bold ${Math.max(12, Math.floor(tileWidth * 0.042))}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillText(`${Number(album.playcount).toLocaleString()} Scrobbles`, x + padX, currentY);
          currentY -= Math.max(16, Math.floor(tileWidth * 0.05));
        }

        if (showTitles) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          // Artist
          ctx.fillStyle = '#e2e8f0';
          ctx.font = `600 ${Math.max(12, Math.floor(tileWidth * 0.044))}px 'Plus Jakarta Sans', sans-serif`;
          const artistText = truncateText(ctx, album.artist.name, tileWidth - padX * 2);
          ctx.fillText(artistText, x + padX, currentY);
          currentY -= Math.max(16, Math.floor(tileWidth * 0.052));

          // Album Name
          ctx.fillStyle = '#ffffff';
          ctx.font = `800 ${Math.max(14, Math.floor(tileWidth * 0.052))}px 'Plus Jakarta Sans', sans-serif`;
          const albumText = truncateText(ctx, album.name, tileWidth - padX * 2);
          ctx.fillText(albumText, x + padX, currentY);
        }
      }

      // Rank Badge
      if (showRanks) {
        const rankNum = album['@attr']?.rank || String(i + 1);
        const badgeSize = Math.max(26, Math.floor(tileWidth * 0.12));
        const badgeX = x + Math.max(8, Math.floor(tileWidth * 0.04));
        const badgeY = y + Math.max(8, Math.floor(tileWidth * 0.04));

        // High-contrast Red Badge
        ctx.fillStyle = '#ff1721';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 6);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(11, Math.floor(badgeSize * 0.48))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rankNum, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
      }
    }

    ctx.restore();
  }
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= 2) break; // Limit to 2 lines
    }
  }
  lines.push(currentLine);
  return lines;
}
