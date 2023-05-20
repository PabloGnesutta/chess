let audioInitialized = false;

let ctx: AudioContext;
let audioOut: AudioDestinationNode;

function initAudio(): void {
  if (!audioInitialized) {
    ctx = new window.AudioContext();
    audioOut = ctx.destination;
    log('Audio initialized');
    audioInitialized = true;
  }
}

export { initAudio };
