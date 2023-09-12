export default class Engine {
  constructor(audioContext, player, globals) {
    this.audioContext = audioContext;
    this.player = player;
    this.globals = globals

    const now = this.audioContext.currentTime;

    this.master = this.audioContext.createGain();
    this.master.gain.setValueAtTime(this.globals.getSchema().master.max, now);

    this.env = this.audioContext.createGain();
    this.env.gain.setValueAtTime(0, now);
    this.env.connect(this.master);

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

    this.env.gain.linearRampToValueAtTime(this.player.get('volume'), now + 0.1);
    this.saw.frequency.value = Number(this.player.get('sawFreq'));
    this.filter.frequency.linearRampToValueAtTime(this.player.get('filterFreq'), now + 0.1);
  }

  updateVolume(gain) {
    const now = this.audioContext.currentTime;
    this.master.gain.linearRampToValueAtTime(gain, now + 0.1);
  }

  getEngineId() {
    return this.player.get('id');
  }

  connect(destination, outlet, inlet) {
    this.master.connect(destination, outlet, inlet);
  }

  disconnect() {
    this.master.disconnect();
  }
}
