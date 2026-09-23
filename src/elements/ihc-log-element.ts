import { customElement, property } from 'lit/decorators.js';
import { IHCManager } from "../ihcmanager";
import { localize } from "../localize";
import { LitElement, css, html } from 'lit';

require("./loader-element");

@customElement("ihc-log")
export class IhcLogElement extends LitElement {

  @property({ type: String, reflect: true })
  public controllerId;

  @property({ type: String, attribute: false })
  public log = "";

  @property({ type: Boolean, attribute: false })
  public isLogLoading = false;

  static get styles() {
    return css`
      #log {
        padding-left: 10px;
        padding-right: 10px;
        padding-top: 10px;
      }
    `;
  }

  render() {
    return html`
      <div id="log">
        ${this.isLogLoading ? html`<ihc-loader/>` : ""}
        <pre id="ihc_log">${this.log == "" ? localize("no_log_data") : this.log}</pre>
      </div>
    `;
  }

  constructor() {
    super();
    this.isLogLoading = false;
    this.log = "";
  }

  async connectedCallback() {
    super.connectedCallback();
    this.logRequest();
  }

  async logRequest() {
    this.isLogLoading = true;
    try {
      let response = await IHCManager.instance.fetchWithAuth(`/api/ihcviewer/log/${this.controllerId}`);
      if (response.ok) {
        let txt = await response.text();
        if (txt == "") {
          this.log = localize("log_is_empty");
        } else {
          this.log = txt;
        }
      }
    }
    finally {
      this.isLogLoading = false;
    }
  }

}

