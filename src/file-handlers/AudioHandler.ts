import type { FileHandler, FileItem, FileHandlerResult } from '@/types';

const ICON_BASE = 'https://win98icons.alexmeub.com/icons/png/';

export const AudioHandler: FileHandler = {
  type: 'audio',
  defaultIcon: `${ICON_BASE}cd_audio_cd_a-4.png`,

  open(file: FileItem): FileHandlerResult {
    const container = document.createElement('div');
    container.className = 'audio-player';

    // Create visualizer bars
    const bars = Array(8).fill(0).map(() => 
      `<div class="audio-player-visualizer-bar" style="height: ${5 + Math.random() * 20}px"></div>`
    ).join('');

    // Handle relative paths with base URL
    const src = file.src?.startsWith('http') 
      ? file.src 
      : `${import.meta.env.BASE_URL}${(file.src || '').replace(/^\//, '')}`;

    container.innerHTML = `
      <div class="audio-player-display">
        <div class="audio-player-title">${file.name}</div>
        <div class="audio-player-visualizer">
          ${bars}
        </div>
      </div>
      <div class="audio-player-controls">
        <div class="audio-player-progress">
          <div class="audio-player-progress-bar"></div>
        </div>
        <div class="audio-player-buttons">
          <button class="audio-player-btn win98-btn btn-prev" title="上一首">|◀</button>
          <button class="audio-player-btn win98-btn btn-play" title="播放">▶</button>
          <button class="audio-player-btn win98-btn btn-stop" title="停止">■</button>
          <button class="audio-player-btn win98-btn btn-next" title="下一首">▶|</button>
        </div>
        <div class="audio-player-time">00:00 / 00:00</div>
      </div>
      <audio src="${src}" style="display: none;"></audio>
    `;

    let audio: HTMLAudioElement | null = null;
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
      if (!audio || !progressBar || !timeDisplay) return;
      const percent = (audio.currentTime / audio.duration) * 100 || 0;
      progressBar.style.width = `${percent}%`;
      timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`;
    };

    const togglePlay = () => {
      if (!audio || !playBtn) return;
      if (audio.paused) {
        audio.play();
        playBtn.textContent = '❚❚';
        container.classList.remove('paused');
      } else {
        audio.pause();
        playBtn.textContent = '▶';
        container.classList.add('paused');
      }
    };

    const stop = () => {
      if (!audio || !playBtn) return;
      audio.pause();
      audio.currentTime = 0;
      playBtn.textContent = '▶';
      container.classList.add('paused');
    };

    return {
      title: file.name,
      content: container,
      windowSize: file.windowSize || { width: 280, height: 200 },
      onMount: (windowEl: HTMLElement) => {
        audio = windowEl.querySelector('audio');
        progressBar = windowEl.querySelector('.audio-player-progress-bar');
        progressContainer = windowEl.querySelector('.audio-player-progress');
        timeDisplay = windowEl.querySelector('.audio-player-time');
        playBtn = windowEl.querySelector('.btn-play');

        // Start paused
        container.classList.add('paused');

        if (audio) {
          audio.addEventListener('timeupdate', updateProgress);
          audio.addEventListener('loadedmetadata', updateProgress);
          audio.addEventListener('ended', () => {
            if (playBtn) playBtn.textContent = '▶';
            container.classList.add('paused');
          });
        }

        playBtn?.addEventListener('click', togglePlay);
        windowEl.querySelector('.btn-stop')?.addEventListener('click', stop);

        // Click on progress bar to seek
        progressContainer?.addEventListener('click', (e) => {
          if (!audio || !progressContainer) return;
          const rect = progressContainer.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          audio.currentTime = percent * audio.duration;
        });
      },
      onDestroy: () => {
        audio?.pause();
        audio = null;
      }
    };
  }
};
