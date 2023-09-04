export default class Engine {
  constructor(audioContext, player, globals, volumeFlag) {
    this.audioContext = audioContext;
    this.player = player;
    this.globals = globals;
    this.volumeFlag = volumeFlag;
    const now = this.audioContext.currentTime;
    this.env = this.audioContext.createGain();
    this.env.gain.setValueAtTime(0, now);
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.Q.value = 11;
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(10, now + 0.1);
    this.filter.connect(this.env);
    this.saw = this.audioContext.createOscillator();
    this.saw.type = 'sawtooth';
    this.saw.connect(this.filter);
    this.saw.start(now);
  }
  render() {
    // sonify
    const now = this.audioContext.currentTime;
    if (this.volumeFlag) {
      // we want gain control
      this.env.gain.linearRampToValueAtTime(this.globals.get('volume'), now + 0.1);
    } else {
      // we dont want gain control
      const maxVolume = this.globals.getSchema().volume.max;
      this.env.gain.linearRampToValueAtTime(maxVolume, now + 0.1);
    }
    this.saw.frequency.value = Number(this.player.get('sawFreq'));
    this.filter.frequency.linearRampToValueAtTime(this.player.get('filterFreq'), now + 0.1);
  }
  updateVolume(gain) {
    const now = this.audioContext.currentTime;
    this.env.gain.linearRampToValueAtTime(gain, now + 0.1);
  }
  getEngineId() {
    return this.player.get('id');
  }
  connect(destination, outlet, inlet) {
    this.env.connect(destination, outlet, inlet);
  }
  disconnect() {
    this.env.disconnect();
  }
}
//# sourceMappingURL=./engine.js.map