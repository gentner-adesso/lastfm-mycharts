import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LastFmAlbum, LastFmTrack, TimePeriod } from '../types/lastfm';
import { getTopAlbums, getTopTracks } from '../services/lastfmApi';
import { renderCollageToCanvas, CollageItem } from '../utils/collageGenerator';
import { deduplicateItems } from '../utils/deduplicator';
import { useLanguage } from '../i18n/LanguageContext';
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
  Disc3,
  Music,
  Merge,
} from 'lucide-react';

type ContentType = 'albums' | 'tracks';

interface GridOption {
  label: string;
  cols: number;
  rows: number;
}

const GRID_OPTIONS: GridOption[] = [
  { label: '3 × 3', cols: 3, rows: 3 },
  { label: '4 × 4', cols: 4, rows: 4 },
  { label: '5 × 5', cols: 5, rows: 5 },
  { label: '2 × 2', cols: 2, rows: 2 },
  { label: '3 × 4', cols: 3, rows: 4 },
  { label: '4 × 5', cols: 4, rows: 5 },
];

const PERIOD_KEYS: TimePeriod[] = [
  '7day',
  '1month',
  '3month',
  '6month',
  '12month',
  'overall',
];

export const CollageSection: React.FC = () => {
  const { t } = useLanguage();
  const [contentType, setContentType] = useState<ContentType>('albums');
  const [period, setPeriod] = useState<TimePeriod>('1month');
  const [grid, setGrid] = useState<GridOption>(GRID_OPTIONS[0]); // 3x3 default
  const [gap, setGap] = useState<number>(8);
  const [showTitles, setShowTitles] = useState<boolean>(true);
  const [showPlaycounts, setShowPlaycounts] = useState<boolean>(true);
  const [showRanks, setShowRanks] = useState<boolean>(true);
  const [deduplicate, setDeduplicate] = useState<boolean>(true);

  const [rawItems, setRawItems] = useState<(LastFmAlbum | LastFmTrack)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch items when period, contentType or required count changes
  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const needed = grid.cols * grid.rows;
        // Fetch up to 100 to allow room for deduplication merging
        const limit = Math.min(100, Math.max(needed * 2, 60));
        
        let data: (LastFmAlbum | LastFmTrack)[] = [];
        if (contentType === 'albums') {
          data = await getTopAlbums(period, limit);
        } else {
          data = await getTopTracks(period, limit);
        }

        if (!isCancelled) {
          setRawItems(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Error loading data from Last.fm');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [period, contentType, grid.cols, grid.rows]);

  // Process items: deduplicate if enabled, otherwise use raw
  const processedItems = useMemo(() => {
    if (!rawItems.length) return [];
    if (deduplicate) {
      return deduplicateItems(rawItems as CollageItem[]);
    }
    return rawItems as CollageItem[];
  }, [rawItems, deduplicate]);

  const totalSlots = grid.cols * grid.rows;
  const currentItems = processedItems.slice(0, totalSlots);

  // Render to canvas whenever items or options change
  useEffect(() => {
    if (!canvasRef.current || processedItems.length === 0) return;

    let isMounted = true;
    setRendering(true);

    const runRender = async () => {
      try {
        if (canvasRef.current) {
          await renderCollageToCanvas(canvasRef.current, {
            items: currentItems,
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
  }, [processedItems, grid, gap, showTitles, showPlaycounts, showRanks]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const typeLabel = contentType === 'albums' ? 'Albums' : 'Songs';
    link.download = `LastFM-${typeLabel}-${period}-${grid.cols}x${grid.rows}.png`;
    link.href = imageUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Title & Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lastfm-red/10 border border-lastfm-red/20 text-lastfm-red">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t.collage.titlePrefix} <span className="text-lastfm-red">{t.collage.titleHighlight}</span>
            </h2>
          </div>
          <p className="text-xs text-neu-muted mt-0.5">
            {t.collage.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {/* Content Type Switcher: Albums vs Songs */}
          <div className="neu-card-sm p-1 flex items-center gap-1 rounded-xl">
            <button
              onClick={() => setContentType('albums')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                contentType === 'albums'
                  ? 'neu-button-active text-lastfm-red border border-lastfm-red/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>{t.collage.albums}</span>
            </button>
            <button
              onClick={() => setContentType('tracks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                contentType === 'tracks'
                  ? 'neu-button-active text-lastfm-red border border-lastfm-red/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{t.collage.tracks}</span>
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading || rendering || currentItems.length === 0}
            className="neu-button-red px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {rendering ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{t.collage.downloadBtn}</span>
          </button>
        </div>
      </div>

      {/* Compact Setup Menu */}
      <div className="neu-card p-3.5 sm:p-4 space-y-3">
        {/* Row 1: Time Period */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-lastfm-red" />
              {t.collage.timePeriod}
            </label>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {PERIOD_KEYS.map((k) => {
              const active = period === k;
              return (
                <button
                  key={k}
                  onClick={() => setPeriod(k)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                    active
                      ? 'neu-button-active text-lastfm-red border border-lastfm-red/40 shadow-sm'
                      : 'neu-button text-neutral-300 hover:text-white'
                  }`}
                >
                  {t.collage.periods[k]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Grid Layout & Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-white/5">
          {/* Grid Size */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Grid className="w-3 h-3 text-lastfm-red" />
              {t.collage.gridFormat}
            </label>
            <div className="grid grid-cols-6 gap-1">
              {GRID_OPTIONS.map((g) => {
                const active = grid.cols === g.cols && grid.rows === g.rows;
                return (
                  <button
                    key={g.label}
                    onClick={() => setGrid(g)}
                    title={`${g.cols * g.rows} ${contentType === 'albums' ? t.userHeader.albums : t.userHeader.tracks}`}
                    className={`px-1.5 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      active
                        ? 'neu-button-active text-lastfm-red border border-lastfm-red/40'
                        : 'neu-button text-neutral-300 hover:text-white'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tile Gap */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Layers className="w-3 h-3 text-lastfm-red" />
              {t.collage.tileGap}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: t.collage.seamless, val: 0 },
                { label: t.collage.compact, val: 8 },
                { label: t.collage.wide, val: 16 },
              ].map((spacing) => {
                const active = gap === spacing.val;
                return (
                  <button
                    key={spacing.val}
                    onClick={() => setGap(spacing.val)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                      active
                        ? 'neu-button-active text-lastfm-red border border-lastfm-red/40'
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

        {/* Row 3: Overlays & Smart Deduplication */}
        <div className="pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Eye className="w-3 h-3 text-lastfm-red" />
              {t.collage.overlays}:
            </span>

            {/* Toggle Titles */}
            <button
              onClick={() => setShowTitles(!showTitles)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showTitles
                  ? 'neu-button-active text-white border border-white/20'
                  : 'neu-button text-neutral-400'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                  showTitles ? 'bg-lastfm-red text-white' : 'bg-neutral-800'
                }`}
              >
                {showTitles && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>{t.collage.toggleTitles}</span>
            </button>

            {/* Toggle Plays */}
            <button
              onClick={() => setShowPlaycounts(!showPlaycounts)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showPlaycounts
                  ? 'neu-button-active text-white border border-white/20'
                  : 'neu-button text-neutral-400'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                  showPlaycounts ? 'bg-lastfm-red text-white' : 'bg-neutral-800'
                }`}
              >
                {showPlaycounts && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <Activity className="w-3 h-3 text-lastfm-red" />
              <span>{t.collage.togglePlays}</span>
            </button>

            {/* Toggle Ranks */}
            <button
              onClick={() => setShowRanks(!showRanks)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showRanks
                  ? 'neu-button-active text-white border border-white/20'
                  : 'neu-button text-neutral-400'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                  showRanks ? 'bg-lastfm-red text-white' : 'bg-neutral-800'
                }`}
              >
                {showRanks && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <Hash className="w-3 h-3 text-lastfm-red" />
              <span>{t.collage.toggleRanks}</span>
            </button>
          </div>

          {/* Smart Deduplication Button */}
          <button
            onClick={() => setDeduplicate(!deduplicate)}
            title="Combines identical releases with different editions, tags, or umlauts"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              deduplicate
                ? 'neu-button-active text-lastfm-red border border-lastfm-red/40'
                : 'neu-button text-neutral-400'
            }`}
          >
            <Merge className="w-3 h-3 text-lastfm-red" />
            <span>{t.collage.deduplicate}</span>
            {deduplicate && (
              <span className="w-1.5 h-1.5 rounded-full bg-lastfm-red animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Collage Preview Canvas Area */}
      <div className="neu-card p-3 sm:p-6 relative">
        {/* Loading overlay */}
        {(loading || rendering) && (
          <div className="absolute inset-0 bg-neu-bg/80 backdrop-blur-sm z-20 rounded-2xl flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-lastfm-red animate-spin" />
            <span className="text-xs font-semibold text-white">
              {loading
                ? contentType === 'albums'
                  ? t.collage.loadingAlbums
                  : t.collage.loadingTracks
                : t.collage.rendering}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs text-center mb-3">
            {error}
          </div>
        )}

        <div className="flex justify-center items-center overflow-hidden neu-inset p-2.5 sm:p-4 rounded-2xl max-w-4xl mx-auto border border-white/15 bg-black">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-w-[850px] rounded-xl shadow-2xl block border border-white/10"
          />
        </div>

        {/* List of included items with scrobbles */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lastfm-red"></span>
            {contentType === 'albums' ? t.collage.includedAlbums : t.collage.includedTracks} ({currentItems.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {currentItems.map((item, idx) => {
              const cover =
                item.image?.find((i) => i.size === 'medium')?.['#text'] ||
                item.image?.[0]?.['#text'];
              return (
                <div
                  key={`${item.name}-${idx}`}
                  className="neu-card-sm p-2.5 flex items-center justify-between gap-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 text-neutral-400 font-mono font-bold shrink-0 text-center text-[11px]">
                      #{idx + 1}
                    </span>
                    {cover ? (
                      <img
                        src={cover}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold shrink-0">
                        {contentType === 'albums' ? 'LP' : 'TRK'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate text-[11px]">{item.name}</div>
                      <div className="text-neutral-400 truncate text-[10px]">{item.artist.name}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-lastfm-red text-[11px]">
                      {item.playcount}
                    </span>
                    <span className="text-[9px] text-neutral-400 block">{t.collage.scrobbles}</span>
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
