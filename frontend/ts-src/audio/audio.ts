import { API_URL } from '../env.js';
import { log } from '../globals.js';

export type SoundName = 'capture' | 'castle' | 'check' | 'moveSelf' | 'promote' | '';

let audioReady = false;

let ctx: AudioContext;
let audioOut: AudioDestinationNode;

const audioBuffers: { [key: string]: AudioBuffer | null } = {
  capture: null,
  castle: null,
  check: null,
  moveSelf: null,
  promote: null,
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
    audioReady = true;
  }
}

function playSound(sound: SoundName): void {
  if (audioReady && sound) {
    playBuffer(audioBuffers[sound] as AudioBuffer);
  }
}

export { initAudio, playSound };
