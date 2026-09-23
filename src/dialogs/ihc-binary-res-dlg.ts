import { customElement, property } from 'lit/decorators.js';
import { IhcResourceDialog } from "./ihc-resource-dlg"
import { CSSResultGroup, css, html } from 'lit';
import { localize } from "../localize";
import { IHCManager } from "../ihcmanager";

// The device classes a binary sensor can have, as the value that goes into
// the manual setup
const DEVICE_CLASSES = [
  "battery", "battery_charging", "cold", "connectivity", "door", "garage_door",
  "gas", "heat", "light", "lock", "moisture", "motion", "moving", "occupancy",
  "opening", "plug", "power", "presence", "safety", "smoke", "sound",
  "vibration", "window",
];

@customElement("ihc-binary-res-dlg")
export class IhcBinaryResourceDialog extends IhcResourceDialog {

  @property({ type: Boolean, attribute: false })
  public inverted: boolean;

  @property({ type: String, attribute: false })
  public type: string;

  constructor() {
    super();
    this.title = localize("dlg_binary_sensor_title");
  }

  static get styles() {
    return super.styles.concat([
      css`
        #type {
          width: 100%;
        }
      `,
      ,
    ]);
  }

  render_controls() {
    return html`
      <div class="control-row">
        <input id="inverted" type="checkbox"/><label for="inverted">${localize("dlg_inverted")}</label>
      </div>
      <div class="control-row">
        <div>${localize("dlg_type")}</div>
        <select id="type">
          <option value=""></option>
          ${this.deviceClasses().map(({ deviceClass, label }) =>
            html`<option value="${deviceClass}">${label}</option>`)}
        </select>
      </div>
    `;
  }

  // Each class in the user's own language, sorted by what the user reads.
  // Home Assistant has the names already - the same ones it shows everywhere
  // else - so the dialog borrows them rather than keeping eight lists of its
  // own. They used to be the bare English values. The class itself stays in
  // brackets: it is what goes into the manual setup, and in Danish occupancy
  // and presence are both "Tilstedevaerelse".
  deviceClasses() {
    const hass = IHCManager.instance?.hass;
    return DEVICE_CLASSES
      .map((deviceClass) => {
        const name = hass?.localize?.(
          `component.binary_sensor.entity_component.${deviceClass}.name`);
        return { deviceClass, label: name ? `${name} (${deviceClass})` : deviceClass };
      })
      .sort((a, b) => a.label.localeCompare(b.label, hass?.locale?.language));
  }

  async onOk() {
    this.inverted = (<HTMLInputElement>this.shadowRoot.getElementById("inverted")).checked;
    this.type = (<HTMLSelectElement>this.shadowRoot.getElementById("type")).value;
    super.onOk();
  }

}
