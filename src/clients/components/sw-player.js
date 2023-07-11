// src/players/components/sw-player.js
import { LitElement, html, css } from 'lit';
import { live } from 'lit/directives/live.js';

// import needed GUI components
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-bang.js';

class SwPlayer extends LitElement {
  constructor() {
    super();
    // stores the `player` state
    this.player = null;
    // stores the `unsubscribe` callback returned by the `state.onUpdate` methos
    // https://soundworks.dev/soundworks/client.SharedState.html#onUpdate
    this._unobserve = null;
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
      <h2>Player [id: ${this.player.get('id')}]</h2>
      <div style="padding-bottom: 4px;">
        <sc-text value="Filter Frequency" readonly></sc-text>
        <sc-slider
          width="400"
          min="0"
          max="1"
          value=${this.player.get('filterSlider')}
          @input=${e => this.player.set({ filterSlider: e.detail.value })}
        ></sc-slider>
        <sc-number
          .value="${this.player.get('filterFreq')}"
        ></sc-number>
        <sc-number
          .value="${this.player.get('numHarm')}"
        ></sc-number>
      </div>
      <div style="padding-bottom: 4px;">
        <sc-text value="Master Volume" readonly></sc-text>
        <sc-slider
          width="400"
          min="0"
          max="1"
          value=${this.player.get('volume')}
          @input=${e => this.player.set({ volume: e.detail.value })}
        ></sc-slider>
      </div>
      <div style="padding-bottom: 4px;">
        <sc-select
          value="${this.player.get('sawFreq')}"
          .options=${this.player.get('selectFreq')}
          @change=${e => this.player.set({ sawFreq: Number(e.target.value) }, { source:'web' })}
        ></sc-select>
      </div>

    `;
  }
}


// register the component into the custom elements registry
customElements.define('sw-player', SwPlayer);
