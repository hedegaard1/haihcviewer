import { customElement, property } from 'lit/decorators.js';
import { IhcResourceDialog } from "./ihc-resource-dlg"
import { css, html } from 'lit';
import { localize } from "../localize";

@customElement("ihc-sensor-res-dlg")
export class IhcSensorResourceDialog extends IhcResourceDialog {

  @property({ type: String, attribute: false })
  public unit: string;

  constructor() {
    super();
    this.title = localize("dlg_sensor_title");
  }

  static get styles() {
    return super.styles.concat(
      css`
      `
    );
  }

  render_controls() {
    return html`
      <div class="control-row">
        <div>${localize("dlg_unit")}</div>
        <input id="unit" type="text" list="common-units"/>
        <datalist id="common-units">
          <option>%</option>
          <option>% RH</option>
          <option>°C</option>
          <option>kW</option>
          <option>kWh</option>
          <option>Lux</option>
          <option>W</option>
          <option>Wh</option>
        </datalist>
      </div>
    `;
  }

  async onOk() {
    this.unit = (<HTMLInputElement>this.shadowRoot.getElementById("unit")).value;
    super.onOk();
  }
}
