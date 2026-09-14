import { create } from 'zustand';
import { useAuthUIStore } from '@/stores/auth-ui.store';

export type SoundKey = 'notification';

const SOUND_SRC: Record<SoundKey, string> = {
  notification: '/sounds/sound_noti.wav',
};

const audioCache = new Map<SoundKey, HTMLAudioElement>();

function getAudio(key: SoundKey): HTMLAudioElement {
  let audio = audioCache.get(key);
  if (!audio) {
    audio = new Audio(SOUND_SRC[key]);
    audioCache.set(key, audio);
  }
  return audio;
}

type SoundState = {
  play: (key?: SoundKey) => void;
};

export const useSoundStore = create<SoundState>(() => ({
  play: (key = 'notification') => {
    if (typeof window === 'undefined') return;
    if (!useAuthUIStore.getState().accessToken) return;

    const audio = getAudio(key);
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  },
}));
