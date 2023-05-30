import { API_URL } from '../env.js';
import { log } from '../globals.js';
import { appState } from '../state/appState.js';
import { LocalMoveResult } from '../state/gameState.js';

export type SoundName = 'CAPTURE' | 'CASTLE' | 'CHECK' | 'MOVE_SELF' | 'PROMOTE' | '';

let ctx: AudioContext;
let audioOut: AudioDestinationNode;

const audioBuffers: { [key: string]: AudioBuffer | null } = {
  CAPTURE: null,
  CASTLE: null,
  CHECK: null,
  MOVE_SELF: null,
  PROMOTE: null,
};

function playBuffer(audioBuffer: AudioBuffer) {
  const bufferSource = ctx.createBufferSource();
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(audioOut);
  bufferSource.start();
}

async function initAudio(): Promise<void> {
  if (!ctx) {
    ctx = new window.AudioContext();
    audioOut = ctx.destination;

    log('Audio initialized... Fetching audio files');

    const promiseArray = [];
    for (const key in audioBuffers) {
      promiseArray.push(
        fetch(API_URL + '/audio-assets/' + key + '.mp3')
          .then(res => res.arrayBuffer())
          .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
          .then(audioBuffer => (audioBuffers[key] = audioBuffer))
          .catch(err => log('Error fetching sound', err))
      );
    }

    const promiseResults = await Promise.allSettled(promiseArray);
    log('Audio loading finished', promiseResults);
    appState.audioReady = true;
  }
}

function playSound(sound: LocalMoveResult): void {
  if (appState.audioReady && sound) {
    playBuffer(audioBuffers[sound] as AudioBuffer);
  }
}

export { initAudio, playSound };
