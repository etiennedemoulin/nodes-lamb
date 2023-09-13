export default class Engine {
  constructor(audioContext, player, globals, volumeFlag) {
    this.audioContext = audioContext;
    this.player = player;
    this.globals = globals;
    const now = this.audioContext.currentTime;
    this.volumeFlag = volumeFlag;
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
    const filterFreq = this.updateFilterSlider();
    this.saw.frequency.value = Number(this.player.get('sawFreq'));
    this.filter.frequency.linearRampToValueAtTime(filterFreq, now + 0.1);
    this.env.gain.linearRampToValueAtTime(this.player.get('volume'), now + 0.1);
    if (this.volumeFlag === true) {
      // phones
      this.master.gain.linearRampToValueAtTime(this.globals.get('master'), now + 0.1);
    } else {
      // node
      this.master.gain.setValueAtTime(1, now + 0.1);
    }
  }
  updateFilterSlider() {
    const filterSlider = this.player.get('filterSlider');
    const sawFreq = this.player.get('sawFreq');
    const filterFreq = Math.floor(Math.max(filterSlider * sawFreq * 7, 10));
    const numHarm = Math.floor(filterFreq / sawFreq);
    this.player.set({
      filterFreq: filterFreq,
      numHarm: numHarm,
      filterSlider: filterSlider
    }, {
      source: 'engine'
    });
    return filterFreq;
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
//# sourceMappingURL=./engine.js.map