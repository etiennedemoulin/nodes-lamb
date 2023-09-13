// src/players/components/sw-player.js
import { LitElement, html, css } from 'lit';
import { live } from 'lit/directives/live.js';
import throttle from 'lodash/throttle.js'

// import needed GUI components
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-select.js';

class SwPlayer extends LitElement {
  static styles = css`
    :host {
      display: block;
      // min-height: calc(100vh - 70px);
      width: inherit;
      height: inherit;
    }

    header {
      display: block;
      height: 70px;
      line-height: 70px;
      background-color: var(--sw-medium-background-color);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: stretch;
      border-bottom: 1px solid var(--sw-lighter-background-color);
    }

    p {
      font-size: 30px;
      margin: 4px;
      height: 30px;
      line-height: 30px;
      text-indent: 0px;
      background-color: #454545;
    }

    .filter > p {
      margin: 15px;
      line-height: 30px;
      text-indent: 8px;
    }

    .volume > p {
      padding: 15px;
      marging: 0px;
      line-height: 30px;
      text-indent: 8px;
    }

    sc-select {
      font-size: 30px;
      height: 62px;
      margin: 4px;
      width: 120px;
      background-color: #454545;
    }

    :host > div {
      display: flex;
      background-color: #121212;
      justify-content: space-between;
      flex-direction: row;
      height: calc(100% - 71px);
    }

    sc-text {
      font-size: 30px;
      margin-top: 10px;
      width: 100%;
    }

    sc-number {
      margin-top: 10px;
      font-size: 30px;
      width: 100%;
      height: 60px;
    }

    sc-slider {
      margin-top: 10px;
      width: 100%;
      height: 100%;
    }

    .filter {
      width: 49%;
      height: inherit;
    }

    .volume {
      width: 49%;
      height: inherit;
    }

  `;

  constructor() {
    super();
    // stores the `player` state
    this.player = null;
    // stores the `unsubscribe` callback returned by the `state.onUpdate` methos
    // https://soundworks.dev/soundworks/client.SharedState.html#onUpdate
    this._unobserve = null;

    const updateVolume = throttle(function (volume) {
      this.player.set({ volume: volume }, { source: 'web'});
    }, 100, { 'trailing' : true});

    const updateFilterSlider = throttle(function (filterSlider) {
      this.player.set({ filterSlider: filterSlider}, { source: 'web'});
    }, 100, { 'trailing' : true});

    this.updateVolume = updateVolume;
    this.updateFilterSlider = updateFilterSlider;
  }

  connectedCallback() {
    super.connectedCallback();
    // update the component when a state change occurs
    this._unobserve = this.player.onUpdate(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // stop reacting to state change when the element is removed from the DOM
    this._unobserve();
  }

  render() {
    // create controls for the player state
    return html`
      <header>
        <div>
          <p>${this.player.get('id')}</p>
          <p>${this.player.get('filterFreq')}Hz|${this.player.get('numHarm')}'</p>
        </div>
        <sc-select
          value="${this.player.get('sawFreq')}"
          .options=${this.player.get('selectFreq')}
          @change=${e => this.player.set({ sawFreq: Number(e.target.value) }, { source:'web' })}
        ></sc-select>
      </header>
      <div>
        <div class="volume">
          <sc-slider
            relative
            orientation="vertical"
            min="${this.player.getSchema().volume.min}"
            max="${this.player.getSchema().volume.max}"
            value=${this.player.get('volume')}
            @input=${e => this.player.set({volume: e.detail.value})}
          ></sc-slider>
          <p>Volume</p>
        </div>
        <div class="filter">
          <sc-slider
            relative
            orientation="vertical"
            min="${this.player.getSchema().filterSlider.min}"
            max="${this.player.getSchema().filterSlider.max}"
            value=${this.player.get('filterSlider')}
            @input=${e => this.updateFilterSlider(e.target.value)}
          ></sc-slider>
          <p>Filter</p>
        </div>
      </div>
    `;
  }
}

// register the component into the custom elements registry
customElements.define('sw-player', SwPlayer);
