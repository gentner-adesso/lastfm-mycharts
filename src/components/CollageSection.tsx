import React, { useEffect, useRef, useState } from 'react';
import { LastFmAlbum, TimePeriod } from '../types/lastfm';
import { getTopAlbums } from '../services/lastfmApi';
import { renderCollageToCanvas } from '../utils/collageGenerator';
import {
  Download,
  Grid,
  Calendar,
  Layers,
  Check,
  Eye,
  Hash,
  Activity,
  Loader2,
} from 'lucide-react';

interface GridOption {
  label: string;
  cols: number;
  rows: number;
}

const GRID_OPTIONS: GridOption[] = [
  { label: '3 × 3 (9 Alben)', cols: 3, rows: 3 },
  { label: '4 × 4 (16 Alben)', cols: 4, rows: 4 },
  { label: '5 × 5 (25 Alben)', cols: 5, rows: 5 },
  { label: '2 × 2 (4 Alben)', cols: 2, rows: 2 },
  { label: '3 × 4 (12 Alben)', cols: 3, rows: 4 },
  { label: '4 × 5 (20 Alben)', cols: 4, rows: 5 },
];

const TIME_RANGES: { label: string; value: TimePeriod }[] = [
  { label: '7 Tage', value: '7day' },
  { label: '1 Monat', value: '1month' },
  { label: '3 Monate', value: '3month' },
  { label: '6 Monate', value: '6month' },
  { label: '12 Monate', value: '12month' },
  { label: 'Gesamt (All Time)', value: 'overall' },
];

export const CollageSection: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('1month');
  const [grid, setGrid] = useState<GridOption>(GRID_OPTIONS[0]); // 3x3 default
  const [gap, setGap] = useState<number>(8);
  const [showTitles, setShowTitles] = useState<boolean>(true);
  const [showPlaycounts, setShowPlaycounts] = useState<boolean>(true);
  const [showRanks, setShowRanks] = useState<boolean>(true);

  const [albums, setAlbums] = useState<LastFmAlbum[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch albums when period or needed count changes
  useEffect(() => {
    let isCancelled = false;
    const fetchAlbums = async () => {
      setLoading(true);
      setError(null);
      try {
        const needed = Math.max(grid.cols * grid.rows, 50);
        const data = await getTopAlbums(period, needed);
        if (!isCancelled) {
          setAlbums(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Fehler beim Laden der Top-Alben');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAlbums();
    return () => {
      isCancelled = true;
    };
  }, [period, grid.cols, grid.rows]);

  // Render to canvas whenever albums or display options change
  useEffect(() => {
    if (!canvasRef.current || albums.length === 0) return;

    let isMounted = true;
    setRendering(true);

    const runRender = async () => {
      try {
        if (canvasRef.current) {
          await renderCollageToCanvas(canvasRef.current, {
            albums,
            cols: grid.cols,
            rows: grid.rows,
            gap,
            showTitles,
            showPlaycounts,
            showRanks,
            style: 'classic',
            targetWidth: 1600,
          });
        }
      } catch (e) {
        console.error('Render error:', e);
      } finally {
        if (isMounted) {
          setRendering(false);
        }
      }
    };

    runRender();

    return () => {
      isMounted = false;
    };
  }, [albums, grid, gap, showTitles, showPlaycounts, showRanks]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `LastFM-Collage-${period}-${grid.cols}x${grid.rows}.png`;
    link.href = imageUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSlots = grid.cols * grid.rows;
  const currentAlbums = albums.slice(0, totalSlots);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-lastfm-red/10 border border-lastfm-red/20 text-lastfm-red">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top-Alben <span className="text-lastfm-red">Collagen Generator</span>
            </h2>
          </div>
          <p className="text-sm text-neu-muted mt-1">
            Erstelle, personalisiere und lade hochauflösende Album-Cover-Grids deiner Hörgewohnheiten herunter.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading || rendering || albums.length === 0}
          className="neu-button-red px-6 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer self-start md:self-auto"
        >
          {rendering ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>High-Res PNG herunterladen</span>
        </button>
      </div>

      {/* Control Panel (Neumorphic Card) */}
      <div className="neu-card p-6 space-y-6">
        {/* Row 1: Time Ranges */}
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Calendar className="w-3.5 h-3.5 text-lastfm-red" />
            Zeitraum auswählen
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {TIME_RANGES.map((t) => {
              const active = period === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setPeriod(t.value)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    active
                      ? 'neu-button-active text-lastfm-red border border-lastfm-red/30'
                      : 'neu-button text-neutral-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Grid Layout & Gap Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-white/10">
          {/* Grid Size */}
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Grid className="w-3.5 h-3.5 text-lastfm-red" />
              Raster / Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRID_OPTIONS.map((g) => {
                const active = grid.cols === g.cols && grid.rows === g.rows;
                return (
                  <button
                    key={g.label}
                    onClick={() => setGrid(g)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                      active
                        ? 'neu-button-active text-lastfm-red border border-lastfm-red/30'
                        : 'neu-button text-neutral-300 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Spacing / Gap */}
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Layers className="w-3.5 h-3.5 text-lastfm-red" />
              Kachelabstand (Gap)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Nahtlos (0px)', val: 0 },
                { label: 'Schmal (8px)', val: 8 },
                { label: 'Breit (16px)', val: 16 },
              ].map((spacing) => {
                const active = gap === spacing.val;
                return (
                  <button
                    key={spacing.val}
                    onClick={() => setGap(spacing.val)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                      active
                        ? 'neu-button-active text-lastfm-red border border-lastfm-red/30'
                        : 'neu-button text-neutral-300 hover:text-white'
                    }`}
                  >
                    {spacing.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Overlays & Detail Toggles */}
        <div className="pt-3 border-t border-white/10">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Eye className="w-3.5 h-3.5 text-lastfm-red" />
            Cover-Overlays & Details
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTitles(!showTitles)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                showTitles
                  ? 'neu-button-active text-white border border-white/20'
                  : 'neu-button text-neutral-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center ${
                  showTitles ? 'bg-lastfm-red text-white' : 'bg-neutral-800'
                }`}
              >
                {showTitles && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Titel & Interpret einblenden</span>
            </button>

            <button
              onClick={() => setShowPlaycounts(!showPlaycounts)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                showPlaycounts
                  ? 'neu-button-active text-white border border-white/20'
                  : 'neu-button text-neutral-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center ${
                  showPlaycounts ? 'bg-lastfm-red text-white' : 'bg-neutral-800'
                }`}
              >
                {showPlaycounts && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <Activity className="w-3.5 h-3.5 text-lastfm-red" />
              <span>Scrobble-Anzahl anzeigen</span>
            </button>

            <button
              onClick={() => setShowRanks(!showRanks)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                showRanks
                  ? 'neu-button-active text-white border border-white/20'
                  : 'neu-button text-neutral-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center ${
                  showRanks ? 'bg-lastfm-red text-white' : 'bg-neutral-800'
                }`}
              >
                {showRanks && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <Hash className="w-3.5 h-3.5 text-lastfm-red" />
              <span>Platzierungen (#1, #2...)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collage Preview Canvas Area */}
      <div className="neu-card p-4 sm:p-8 relative">
        {/* Loading overlay */}
        {(loading || rendering) && (
          <div className="absolute inset-0 bg-neu-bg/70 backdrop-blur-sm z-20 rounded-2xl flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-lastfm-red animate-spin" />
            <span className="text-sm font-semibold text-white">
              {loading ? 'Lade Top-Alben...' : 'Rendere hochauflösende Collage...'}
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-sm text-center mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-center items-center overflow-hidden neu-inset p-3 sm:p-5 rounded-2xl max-w-4xl mx-auto border border-white/15 bg-black">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-w-[850px] rounded-xl shadow-2xl block border border-white/10"
          />
        </div>

        {/* List of included albums with scrobbles */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lastfm-red"></span>
            In dieser Collage enthalten ({currentAlbums.length} Alben)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentAlbums.map((album, idx) => {
              const cover =
                album.image?.find((i) => i.size === 'medium')?.['#text'] ||
                album.image?.[0]?.['#text'];
              return (
                <div
                  key={`${album.name}-${idx}`}
                  className="neu-card-sm p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 text-neutral-500 font-mono font-bold shrink-0 text-center">
                      #{idx + 1}
                    </span>
                    {cover ? (
                      <img
                        src={cover}
                        alt={album.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold shrink-0">
                        LP
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{album.name}</div>
                      <div className="text-neutral-400 truncate">{album.artist.name}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-lastfm-red">
                      {album.playcount}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">Scrobbles</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
