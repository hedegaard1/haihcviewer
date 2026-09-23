import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement("ihc-loader")
export class LoaderElement extends LitElement {

  // A smaller ring, to sit inside a line of text - beside "Saving...", or in
  // the header while the ihc integration is reloaded
  @property({ type: Boolean, reflect: true })
  public small = false;

  static get styles() {
    return css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      :host([small]) .loader {
        width: 12px;
        height: 12px;
        border-width: 2px;
      }
      /* The same thin ring Home Assistant itself shows while it is starting,
         so a panel that is still loading looks like the rest of the house
         rather than like a different program.

         In the theme's own colour. It used to be #3498db on #f3f3f3, which
         was blue whatever the theme said, and the near-white track sat as a
         bright ring on a dark background. There is no track now - the gap in
         the arc is what shows it is turning. */
      .loader {
        width: 48px;
        height: 48px;
        border: 5px solid var(--primary-color);
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `;
  }

  render() {
    return html`<div class="loader"></div>`;
  }

  constructor() {
    super();
  }
}
