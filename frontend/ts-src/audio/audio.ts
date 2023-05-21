let ctx: AudioContext;
let audioOut: AudioDestinationNode;

const audioCapture = document.getElementById('capture') as HTMLMediaElement;
const audioCastle = document.getElementById('castle') as HTMLMediaElement;
const audioCheck = document.getElementById('check') as HTMLMediaElement;
const audioMoveSelf = document.getElementById('move-self') as HTMLMediaElement;
const audioPromote = document.getElementById('promote') as HTMLMediaElement;

function initAudio(): void {
  if (!ctx) {
    ctx = new window.AudioContext();
    audioOut = ctx.destination;
    log('Audio initialized');
  }
}

export type SoundName = 'capture' | 'castle' | 'check' | 'move-self' | 'promote' | '';

function playSound(sound: SoundName): void {
  log('Play sound: ', sound);
  switch (sound) {
    case 'capture':
      audioCapture.play();
      break;
    case 'castle':
      audioCastle.play();
      break;
    case 'check':
      audioCheck.play();
      break;
    case 'move-self':
      audioMoveSelf.play();
      break;
    case 'promote':
      audioPromote.play();
      break;
    default:
      break;
  }
}

export { initAudio, playSound };
