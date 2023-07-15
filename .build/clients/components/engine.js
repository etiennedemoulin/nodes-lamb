export default class Engine {
  constructor(audioContext, player, volumeFlag = true) {
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
    this.filter.frequency.setValueAtTime(10, now + 0.1);
    this.saw.connect(this.filter);
    this.filter.connect(this.env);
    this.saw.start(now);
  }
  render() {
    // hook from engine !
    const filterFreq = this.computeFilterValues();

    // sonify
    const now = this.audioContext.currentTime;
    if (this.volumeFlag === true) {
      this.env.gain.linearRampToValueAtTime(this.player.get('volume'), now + 0.1);
    } else {
      this.env.gain.linearRampToValueAtTime(0.1, now + 0.1);
    }
    this.saw.frequency.value = Number(this.player.get('sawFreq'));
    this.filter.frequency.linearRampToValueAtTime(filterFreq, now + 0.1);
  }
  computeFilterValues() {
    const sliderValue = this.player.get('filterSlider');
    const sawFreq = this.player.get('sawFreq');
    const filterFreq = Math.max(sliderValue * sawFreq * 7, 10);
    const numHarm = Math.floor(filterFreq / sawFreq);
    this.player.set({
      filterFreq: filterFreq,
      numHarm: numHarm
    }, {
      source: 'engine'
    });
    return filterFreq;
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