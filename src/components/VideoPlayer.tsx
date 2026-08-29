import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  MessageSquare,
  WifiOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { Movie, Episode } from '../types';

interface VideoPlayerProps {
  movie: Movie;
  episode?: Episode;
  isOfflinePlayback?: boolean;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  episode,
  isOfflinePlayback = false,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState('Filipino');
  const [selectedAudio, setSelectedAudio] = useState(movie.audioTracks[0] || 'Filipino (Original)');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: any;
    const resetControls = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3500);
      }
    };

    window.addEventListener('mousemove', resetControls);
    window.addEventListener('touchstart', resetControls);

    return () => {
      window.removeEventListener('mousemove', resetControls);
      window.removeEventListener('touchstart', resetControls);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSec: number) => {
    const min = Math.floor(timeInSec / 60);
    const sec = Math.floor(timeInSec % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const videoSourceUrl = episode ? episode.videoUrl : movie.videoUrl;

  // Determine if videoSourceUrl is an embed link or iframe URL
  const isEmbed =
    videoSourceUrl.includes('iframe') ||
    videoSourceUrl.includes('/e/') ||
    videoSourceUrl.includes('embed') ||
    videoSourceUrl.includes('abyss') ||
    videoSourceUrl.includes('short.ink') ||
    videoSourceUrl.includes('youtube.com') ||
    videoSourceUrl.includes('youtu.be') ||
    videoSourceUrl.includes('dailymotion.com') ||
    videoSourceUrl.includes('vimeo.com') ||
    videoSourceUrl.includes('doodstream') ||
    videoSourceUrl.includes('streamwish') ||
    videoSourceUrl.includes('filelions') ||
    videoSourceUrl.includes('streamtape') ||
    videoSourceUrl.includes('vidhide') ||
    videoSourceUrl.includes('mp4upload') ||
    !videoSourceUrl.endsWith('.mp4');

  // Extract clean embed url if it's wrapped in iframe
  const getEmbedSrc = (url: string) => {
    const trimmed = url.trim();
    if (trimmed.includes('<iframe')) {
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Active Video Element or iFrame Embed */}
      {isEmbed ? (
        <div className="w-full h-full flex flex-col bg-black relative">
          <iframe
            src={getEmbedSrc(videoSourceUrl)}
            className="w-full h-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            title={movie.title}
          />
          {/* Floating Back Button for Embed Player */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-40 p-2.5 rounded-full bg-black/80 hover:bg-neutral-800 text-white transition-colors border border-neutral-700 shadow-xl flex items-center gap-1.5 text-xs font-bold"
            aria-label="Back to browse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bumalik sa Pinoysinehub</span>
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoSourceUrl}
          className="w-full h-full object-contain cursor-pointer"
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
      )}

      {/* REGULAR STREAMING PLAYER CONTROLS (For native video playback) */}
      {!isEmbed && (
        <div
          className={`absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-t from-black/90 via-transparent to-black/80 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                id="player-back-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-black/60 hover:bg-neutral-800 text-white transition-colors border border-neutral-700"
                aria-label="Back to browse"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{movie.title}</span>
                  {episode && <span className="text-neutral-400 font-normal">• {episode.title}</span>}
                </h3>
                {isOfflinePlayback && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline Playback from Device Storage
                  </span>
                )}
              </div>
            </div>

            {/* Lock Screen */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScreenLocked(!isScreenLocked)}
                className={`p-2 rounded-full text-xs font-semibold border transition-colors ${
                  isScreenLocked
                    ? 'bg-[#E50914] text-white border-[#E50914]'
                    : 'bg-black/60 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
                title={isScreenLocked ? 'Unlock Screen Controls' : 'Lock Screen'}
              >
                {isScreenLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Center Play/Pause & 10s Skips */}
          {!isScreenLocked && (
            <div className="flex items-center justify-center gap-8 sm:gap-14">
              <button
                onClick={() => handleSkip(-10)}
                className="p-3 rounded-full bg-black/40 hover:bg-neutral-800/80 text-white transition-all active:scale-90"
                title="10 seconds backward"
              >
                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 sm:p-5 rounded-full bg-white/95 text-black hover:bg-white transition-all shadow-2xl active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-7 h-7 sm:w-9 sm:h-9 fill-black" /> : <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-black translate-x-0.5" />}
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-3 rounded-full bg-black/40 hover:bg-neutral-800/80 text-white transition-all active:scale-90"
                title="10 seconds forward"
              >
                <RotateCw className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>
          )}

          {/* Bottom Bar: Timeline + Controls */}
          {!isScreenLocked && (
            <div className="space-y-2">
              {/* Timeline */}
              <div className="relative flex items-center group">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 sm:h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#E50914] z-10"
                />
              </div>

              {/* Time display & Additional controls */}
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Speed Selector */}
                  <button
                    onClick={() => {
                      const speeds = [0.75, 1, 1.25, 1.5];
                      const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                      setPlaybackSpeed(nextSpeed);
                      if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
                    }}
                    className="font-bold hover:text-white px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Subtitles & Audio Picker */}
                  <button
                    onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                    className={`hover:text-white flex items-center gap-1 ${selectedSubtitle !== 'Off' ? 'text-[#E50914] font-bold' : ''}`}
                    title="Audio & Subtitles"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Audio & Subs</span>
                  </button>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="hover:text-white">
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtitles / Audio Selection Modal */}
      {showSubtitleMenu && (
        <div className="absolute inset-0 z-40 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-white text-sm">Audio at Subtitles</h3>
              <button onClick={() => setShowSubtitleMenu(false)} className="text-neutral-400 hover:text-white text-xs">
                Tapos na (Done)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Audio Tracks */}
              <div>
                <h4 className="font-bold text-neutral-400 mb-2">Audio</h4>
                <div className="space-y-1.5">
                  {movie.audioTracks.map((track) => (
                    <button
                      key={track}
                      onClick={() => setSelectedAudio(track)}
                      className={`w-full text-left p-2 rounded-lg ${selectedAudio === track ? 'bg-[#E50914] text-white font-bold' : 'bg-neutral-800 text-neutral-300'}`}
                    >
                      {track}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitles */}
              <div>
                <h4 className="font-bold text-neutral-400 mb-2">Subtitles</h4>
                <div className="space-y-1.5">
                  {['Off', ...movie.subtitles].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubtitle(sub)}
                      className={`w-full text-left p-2 rounded-lg ${selectedSubtitle === sub ? 'bg-[#E50914] text-white font-bold' : 'bg-neutral-800 text-neutral-300'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
