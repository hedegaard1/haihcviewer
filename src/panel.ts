import { customElement, property } from 'lit/decorators.js';
import { haStyle } from "../homeassistant-frontend/src/resources/styles"
import { IHCManager } from "./ihcmanager";
import { IhcControllerElement } from "./elements/ihc-controller-element";
import { localize, setLanguage } from "./localize";
import { CSSResultGroup, LitElement, css, html } from "lit";

require("./elements/ihc-controller-element");
require("./ihcmanager");

// This is the main Home Assistant panel for the IHCViewer
@customElement("ha-panel-ihcviewer")
export class HaPanelIHCViewer extends LitElement {

  // Home Assistant object
  @property({ type: Object })
  public hass;

  // If should render in narrow mode
  @property({ type: Boolean })
  public narrow;

  // If sidebar is currently shown
  @property({ type: Boolean })
  public showMenu;

  // Home Assistant panel info
  // panel.config contains config passed to register_panel serverside
  @property({ type: Object })
  public panel;

  // The selected controller id
  @property({ type: String })
  public selectedcontrollerid;

  // Set when a change to the manual ihc setup is saved but not in effect.
  // Adding and removing reload the ihc integration by themselves, so this is
  // only seen when that did not go through - and the button tries again.
  @property({ type: Boolean, attribute: false })
  public reloadNeeded = false;

  // Set while the ihc integration is being reloaded
  @property({ type: Boolean, attribute: false })
  public reloading = false;

  // Set when the reload did not succeed
  @property({ type: Boolean, attribute: false })
  public reloadFailed = false;

  static panelStyles =
    css`
    /* No height on purpose. Home Assistant hands a panel a box with no
       height of its own, so height:100% here has nothing to resolve against
       and quietly becomes auto. The panel is as tall as its content and the
       page scrolls it - one scrollbar rather than two. */
    :host {
      display: block;
    }
    #ihcviewer {
      width: 100%;
    }
    #controllers {
      width: 100%;
    }
    /* These sit in the controller's own card through a slot, but they are
       written here, so this is where they are styled */
    #controllerselector {
      padding-left: 8px;
    }
    /* It sits among the tabs now, so it takes their shape. In the theme's own
       colour rather than grey: it is the one button on the page that has to
       be noticed, and it only turns up when a change is waiting to be put
       into effect. */
    #reloadihc {
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      padding: 5px 16px;
      cursor: pointer;
      border: 1px solid var(--primary-color);
      border-radius: 16px;
      background-color: transparent;
      color: var(--primary-color);
    }
    #reloadihc:hover {
      background-color: var(--secondary-background-color);
    }
    #reloadstatus {
      display: inline-block;
      cursor: default;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
  `;

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      HaPanelIHCViewer.panelStyles
    ];
  }


  render() {

    if (this.panel.config['ihcviewer'] == null) return html`${localize("no_controllers")}`
    // The title, the tabs and these buttons all live in the card at the top of
    // the controller, so they are handed down into it rather than sitting in a
    // band of their own above everything.
    return html`
      <div id="ihcviewer"  @reloadneeded=${this.onReloadNeeded}>
        <div id="controllers">
          ${this.panel.config['ihcviewer'].map((controllerid, index) => html`
              <ihc-controller id="ihccontroller_${index}" controllerId="${controllerid}" show="${this.selectedcontrollerid == controllerid}">
                <span slot="header-actions">
                  ${this.render_restart()}
                  ${this.render_controllersSelector()}
                </span>
              </ihc-controller>
          `)}
        </div>
      </div>
    `;
  }

  render_restart() {
    if (this.reloading)
      return html`<span id="reloadstatus"><ihc-loader small></ihc-loader> ${localize("reloading_ihc")}</span>`;
    if (!this.reloadNeeded) return "";
    return html`
      <span>
        <button id="reloadihc" @click=${this.onReload}
          title="${localize("reload_ihc_title")}">${localize("reload_ihc")}</button>
        ${this.reloadFailed ? html`<span id="reloadstatus">${localize("reload_failed")}</span>` : ""}
      </span>`
  }

  render_controllersSelector() {
    if (this.panel.config['ihcviewer'].length <= 1) return html`<span></span>`;
    return html`
      <span id="controllerselector">
        <select @change=${this.onChangeController}>
          ${this.panel.config['ihcviewer'].map(id => html`<option value="${id}">${id}</option>`)}
        </select>
      </span>`;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    // The user's own language, so the panel is drawn in it from the first frame
    setLanguage(this.hass?.locale?.language || this.hass?.language);
    IHCManager.initialize(this.hass);
    // Select the first controller by default
    this.selectedcontrollerid = this.panel.config['ihcviewer'][0];
  }

  onChangeController(event) {
    this.selectedcontrollerid = event.target.value;
    this.requestUpdate();
  }

  onReloadNeeded(event) {
    this.reloadNeeded = true;
    return false;
  }

  // Reload the ihc integration by hand, when doing it by itself after a
  // change did not go through. The ihc integration reads
  // ihc_manual_setup.yaml when its config entry is set up, so this does what
  // a Home Assistant restart used to do.
  async onReload() {
    if (this.reloading) return;
    this.reloading = true;
    this.reloadFailed = false;
    let response = await IHCManager.instance.fetchWithAuth(
      `/api/ihcviewer/reload/${this.selectedcontrollerid}`, { method: 'POST' });
    this.reloading = false;
    if (!response.ok) {
      this.reloadFailed = true;
      return;
    }
    this.reloadNeeded = false;
    let controllers = this.shadowRoot.querySelectorAll("ihc-controller");
    for (let controller of Array.from(controllers) as IhcControllerElement[]) {
      await controller.refreshAfterReload();
    }
  }
}