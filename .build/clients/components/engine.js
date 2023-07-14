export default class Engine {
  constructor(audioContext, player, volumeFlag) {
    this.audioContext = audioContext;
    this.player = player;
    this.volumeFlag = volumeFlag;
    const now = this.audioContext.currentTime;
    this.saw = this.audioContext.createOscillator();
    this.env = this.audioContext.createGain();
    this.filter = this.audioContext.createBiquadFilter();
    this.env.gain.setValueAtTime(0, now);
    this.saw.type = 'sawtooth';
    this.filter.Q.value = 11;
    this.filter.type = "lowpass";
    this.saw.connect(this.filter);
    this.filter.connect(this.env);
    // this.env.connect(this.audioContext.destination);
    this.saw.start(now);
    this.render();
  }
  render() {
    const now = this.audioContext.currentTime;
    if (this.volumeFlag) {
      this.env.gain.linearRampToValueAtTime(this.player.get('volume'), now + 0.1);
    } else {
      this.env.gain.linearRampToValueAtTime(0.7, now + 0.1);
    }
    this.saw.frequency.value = Number(this.player.get('sawFreq'));
    this.filter.frequency.linearRampToValueAtTime(this.player.get('filterFreq'), now + 0.1);
  }
  getEngineId() {
    return this.player.get('id');
  }
}
//# sourceMappingURL=./engine.js.map