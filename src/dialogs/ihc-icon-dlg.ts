import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { IhcResourceDialog } from "./ihc-resource-dlg";
import { GROUP_ICON } from "../icons";
import { IHCManager } from "../ihcmanager";
import { localize } from "../localize";

// Home Assistant's own icon picker - the one with every icon and a search
// field - is not loaded for a custom panel, and there is no supported way to
// ask for one element on its own. What works, and what every custom card does,
// is to ask a built-in card for its config element: that pulls in the editor
// bundle, and the picker is registered along with it.
//
// It is Home Assistant's internals, so it can stop working at an update. It
// therefore only ever adds something: fails it, the dialog falls back to a
// plain field where the icon name is typed, which is no worse than before.
async function loadIconPicker(): Promise<boolean> {
  if (customElements.get("ha-icon-picker")) return true;
  try {
    const helpers = await (window as any).loadCardHelpers();
    const card = await helpers.createCardElement({ type: "entities", entities: [] });
    const cls = card?.constructor as any;
    if (cls?.getConfigElement) await cls.getConfigElement();
  } catch (err) {
    return false;
  }
  // Registering is not necessarily done when the call returns
  await Promise.race([
    customElements.whenDefined("ha-icon-picker"),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  return !!customElements.get("ha-icon-picker");
}

// Picks the icon for one room.
@customElement("ihc-icon-dlg")
export class IhcIconDialog extends LitElement {

  // Which room, and what it is called - the title says so, because by the time
  // the dialog is open the row behind it is covered
  @property({ type: Number, attribute: false })
  public groupId: number;

  @property({ type: String, attribute: false })
  public groupName = "";

  @property({ type: String, attribute: false })
  public icon = "";

  // Whether Home Assistant's picker is available. Undefined until we have
  // tried, and the dialog shows the plain field meanwhile.
  @property({ type: Boolean, attribute: false })
  public pickerReady = false;

  static get styles() {
    return IhcResourceDialog.styles.concat(css`
      .coloumn {
        width: 24em;
        max-width: 80vw;
      }
      .iconrow {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 8px;
      }
      .iconrow > ha-icon {
        flex: 0 0 auto;
        width: 32px;
        height: 32px;
        --mdc-icon-size: 32px;
        color: var(--primary-color);
      }
      .iconrow > ha-icon-picker,
      .iconrow > input {
        flex: 1 1 auto;
        min-width: 0;
      }
      .hint {
        font-size: 12px;
        line-height: 16px;
        color: var(--secondary-text-color);
      }
    `);
  }

  render() {
    return html`
      <div id="dlgmask"></div>
      <div id="dlg" class="dlg">
        <div class="dlgtitle">${localize("dlg_icon_title", this.groupName)}</div>
        <div class="coloumn">
          <div class="iconrow">
            <ha-icon .icon=${this.icon || GROUP_ICON}></ha-icon>
            ${this.render_field()}
          </div>
          ${this.pickerReady ? "" : html`<div class="hint">${localize("dlg_icon_hint")}</div>`}
        </div>
        <div class="buttonrow">
          <button @click=${this.onOk}>${localize("dlg_ok")}</button>
          <button @click=${this.onClear}>${localize("dlg_icon_clear")}</button>
          <button @click=${this.onCancel}>${localize("dlg_cancel")}</button>
        </div>
      </div>`;
  }

  render_field() {
    if (this.pickerReady) {
      return html`<ha-icon-picker
        .hass=${IHCManager.instance?.hass}
        .value=${this.icon}
        .placeholder=${GROUP_ICON}
        @value-changed=${this.onPicked}></ha-icon-picker>`;
    }
    return html`<input id="icon" type="text" placeholder="${GROUP_ICON}"
      .value=${this.icon} @input=${this.onInput}/>`;
  }

  async open(groupId: number, groupName: string, icon: string) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.icon = icon || "";
    this.shadowRoot.getElementById("dlgmask").style.display = 'block';
    this.shadowRoot.getElementById("dlg").style.display = 'block';
    this.pickerReady = await loadIconPicker();
  }

  close() {
    this.shadowRoot.getElementById("dlgmask").style.display = 'none';
    this.shadowRoot.getElementById("dlg").style.display = 'none';
  }

  // Redraw as it changes, so the icon beside the field is the answer to
  // "is this the one I meant"
  onPicked(event) {
    this.icon = event.detail?.value || "";
  }

  onInput(event) {
    this.icon = event.target.value;
  }

  onOk() {
    this.close();
    this.dispatchEvent(new CustomEvent('ok'));
  }

  // Back to the folder. It is the same as saving an empty name, but a button
  // says so where an empty field only implies it.
  onClear() {
    this.icon = "";
    this.close();
    this.dispatchEvent(new CustomEvent('ok'));
  }

  onCancel() {
    this.close();
  }
}
