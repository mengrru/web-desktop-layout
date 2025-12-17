import type { FileHandler, FileItem, FileHandlerResult } from '@/types';

const ICON_BASE = 'https://win98icons.alexmeub.com/icons/png/';

export const VideoHandler: FileHandler = {
  type: 'video',
  defaultIcon: `${ICON_BASE}media_player_stream_off-0.png`,

  open(file: FileItem): FileHandlerResult {
    const container = document.createElement('div');
    container.className = 'video-player';

    // Handle relative paths with base URL
    const src = file.src?.startsWith('http') 
      ? file.src 
      : `${import.meta.env.BASE_URL}${(file.src || '').replace(/^\//, '')}`;

    container.innerHTML = `
      <div class="video-player-display">
        <video src="${src}"></video>
      </div>
      <div class="video-player-controls">
        <div class="video-player-progress">
          <div class="video-player-progress-bar"></div>
        </div>
        <div class="video-player-buttons">
          <button class="video-player-btn win98-btn btn-play" title="播放">▶</button>
          <button class="video-player-btn win98-btn btn-stop" title="停止">■</button>
          <span class="video-player-time">00:00 / 00:00</span>
        </div>
      </div>
    `;

    let video: HTMLVideoElement | null = null;
    let progressBar: HTMLElement | null = null;
    let progressContainer: HTMLElement | null = null;
    let timeDisplay: HTMLElement | null = null;
    let playBtn: HTMLButtonElement | null = null;

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const updateProgress = () => {
      if (!video || !progressBar || !timeDisplay) return;
      const percent = (video.currentTime / video.duration) * 100 || 0;
      progressBar.style.width = `${percent}%`;
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
    };

    const togglePlay = () => {
      if (!video || !playBtn) return;
      if (video.paused) {
        video.play();
        playBtn.textContent = '❚❚';
      } else {
        video.pause();
        playBtn.textContent = '▶';
      }
    };

    const stop = () => {
      if (!video || !playBtn) return;
      video.pause();
      video.currentTime = 0;
      playBtn.textContent = '▶';
    };

    return {
      title: file.name,
      content: container,
      windowSize: file.windowSize || { width: 480, height: 360 },
      onMount: (windowEl: HTMLElement) => {
        video = windowEl.querySelector('video');
        progressBar = windowEl.querySelector('.video-player-progress-bar');
        progressContainer = windowEl.querySelector('.video-player-progress');
        timeDisplay = windowEl.querySelector('.video-player-time');
        playBtn = windowEl.querySelector('.btn-play');

        if (video) {
          video.addEventListener('timeupdate', updateProgress);
          video.addEventListener('loadedmetadata', updateProgress);
          video.addEventListener('ended', () => {
            if (playBtn) playBtn.textContent = '▶';
          });
        }

        playBtn?.addEventListener('click', togglePlay);
        windowEl.querySelector('.btn-stop')?.addEventListener('click', stop);

        // Click on progress bar to seek
        progressContainer?.addEventListener('click', (e) => {
          if (!video || !progressContainer) return;
          const rect = progressContainer.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          video.currentTime = percent * video.duration;
        });
      },
      onDestroy: () => {
        video?.pause();
        video = null;
      }
    };
  }
};
