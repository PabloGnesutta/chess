let audioInitialized = false;

let ctx: AudioContext;
let audioOut: AudioDestinationNode;

const audioCapture = document.getElementById('capture') as HTMLMediaElement;
const audioCastle = document.getElementById('castle') as HTMLMediaElement;
const audioCheck = document.getElementById('check') as HTMLMediaElement;
const audioMoveSelf = document.getElementById('move-self') as HTMLMediaElement;
const audioPromote = document.getElementById('promote') as HTMLMediaElement;

function initAudio(): void {
  if (!audioInitialized) {
    ctx = new window.AudioContext();
    audioOut = ctx.destination;
    log('Audio initialized');
    audioInitialized = true;
  }

  // const captureSource = ctx.createMediaElementSource(captureAudioElement).connect(audioOut);
  // const castleSource = ctx.createMediaElementSource(castleAudioElement).connect(audioOut);
  // const checkSource = ctx.createMediaElementSource(checkAudioElement).connect(audioOut);
  // const moveSelfSource = ctx.createMediaElementSource(moveSelfAudioElement).connect(audioOut);
  // const promoteSource = ctx.createMediaElementSource(promoteAudioElement).connect(audioOut);
}

export { initAudio, audioCapture, audioCastle, audioCheck, audioMoveSelf, audioPromote };
