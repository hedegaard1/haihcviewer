import { customElement, property } from 'lit/decorators.js';

import { IhcBinaryResourceDialog } from "../dialogs/ihc-binary-res-dlg";
import { IhcRemoveDialog } from "../dialogs/ihc-remove-dlg";
import { IhcResourceDialog } from "../dialogs/ihc-resource-dlg"
import { IhcSensorResourceDialog } from "../dialogs/ihc-sensor-res-dlg";

import { copyTextToClipboard } from "../copytoclipboard";
import { IHCManager } from "../ihcmanager";
import { IhcTreeNode, platformLabel } from "./ihc-tree-node";
import { IHCInput, IHCResource } from "../ihcproject";
import { hasProductIcon } from "../icons";
import { localize } from "../localize";
import { isEntityId, suggestName } from "../logic";
import { LitElement, css, html } from 'lit';

require("../dialogs/ihc-resource-dlg");
require("../dialogs/ihc-remove-dlg");
require("../dialogs/ihc-binary-res-dlg");
require("../dialogs/ihc-sensor-res-dlg");
require("../dialogs/ihc-resource-dlg");
require("./loader-element");

@customElement("ihc-properties")
export class IhcPropertiesElement extends LitElement {

  private action_binary_sensor: boolean;
  private action_light: boolean;
  private action_sensor: boolean;
  private action_switch: boolean;
  private selectednode: IhcTreeNode;

  @property({ type: String })
  public controllerId;

  @property({ type: Boolean, attribute: false })
  public isLoading = false;

  // Adding or removing is under way. It takes a few seconds - the ihc
  // integration is reloaded to put the change into effect - and the ring
  // says that something is happening rather than nothing.
  @property({ type: Boolean, attribute: false })
  public working = false;

  // Why the last add or remove did not go through, as a localize key
  @property({ type: String, attribute: false })
  public changeError = "";

  @property({ type: Object, attribute: false })
  public selected = null;

  // What the two fields hold right now, and what was last saved. The two are
  // compared to decide whether there is anything to save - so the Save button
  // only appears once something has actually been typed.
  @property({ type: String, attribute: false })
  public nameDraft = "";

  @property({ type: String, attribute: false })
  public savedName = "";

  @property({ type: String, attribute: false })
  public entityDraft = "";

  // The entity id is behind a lock. It can be changed - but everything that
  // points at the old one stops working, and this panel cannot say what that
  // is. So it is not something to do by brushing past a field.
  @property({ type: Boolean, attribute: false })
  public editingEntityId = false;

  // Which field is being saved right now, and which one has just been saved -
  // "name", "entity" or nothing. Two fields save themselves here, and a
  // message that does not say which one it belongs to is no message.
  @property({ type: String, attribute: false })
  public saving = "";

  @property({ type: String, attribute: false })
  public savedNow = "";

  // A key from the localize table, so the reason is in the user's language
  @property({ type: String, attribute: false })
  public renameError = "";

  // Waiting for the typing to stop before the name is saved, and for the
  // "saved" beside the field to go away again
  private nameTimer = null;
  private savedTimer = null;

  public on_id;
  public off_id;

  static get styles() {
    return [
      IhcResourceDialog.button_style,
      css`
      :host {
        display: block;
        /* The three sections below measure themselves against the pane, not
           against the window - the sidebar and the padding are not theirs to
           know about */
        container-type: inline-size;
        /* The pane is stuck to the bottom of the window, so its height is
           taken from the tree above it. Three sections side by side fit in
           well under this; one section above another, on a narrow window,
           would otherwise take most of the screen and leave nothing to pick
           the next resource from. */
        max-height: 45vh;
        overflow-y: auto;
      }

      /* What is selected, said once at the top. Before this the pane opened
         with a resource id and no name, so the only way to know what it was
         describing was to remember which row you had just pressed. */
      #head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 0 8px 0;
      }
      #head .headname {
        font-size: 16px;
        font-weight: 500;
      }
      #head .headsub {
        color: var(--secondary-text-color);
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #head .spacer {
        flex: 1 1 auto;
      }
      #head .headicon {
        color: var(--primary-color);
      }
      #close {
        cursor: pointer;
        color: var(--secondary-text-color);
      }
      #close:hover {
        color: var(--primary-color);
      }
      /* While a change is put into effect - the same ring, and the same text
         under it, as while the project loads */
      #working {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        color: var(--secondary-text-color);
      }

      /* Three columns: what it is in ihc, what it is in Home Assistant, and
         what can be done about it. They were one long list before, where the
         resource id sat next to the buttons that change the installation. */
      #sections {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0 24px;
      }
      section {
        min-width: 0;
        padding-right: 8px;
      }
      /* A line between them rather than a box around each: this is a strip
         along the bottom of the window, and three boxes inside a bordered
         strip is one border too many */
      section + section {
        border-left: 1px solid var(--divider-color);
        padding-left: 24px;
      }
      /* While the resource can be added, the platforms to pick from get the
         full width along the bottom, side by side, and ihc and Home Assistant
         share the row above. In the third column the three stood one under
         the other with their help text, and the pane grew taller than the
         window allows, so the column scrolled on its own. */
      #sections.adding {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      #sections.adding section:nth-child(3) {
        grid-column: 1 / -1;
        border-left: none;
        padding-left: 0;
        padding-top: 10px;
        margin-top: 10px;
        border-top: 1px solid var(--divider-color);
      }
      #sections.adding .actionlist {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px 24px;
      }
      @container (max-width: 900px) {
        #sections {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        section:nth-child(3) {
          border-left: none;
          padding-left: 0;
          padding-top: 10px;
          margin-top: 10px;
          border-top: 1px solid var(--divider-color);
          grid-column: 1 / -1;
        }
      }
      @container (max-width: 560px) {
        #sections, #sections.adding, #sections.adding .actionlist {
          grid-template-columns: minmax(0, 1fr);
        }
        section + section {
          border-left: none;
          padding-left: 0;
          padding-top: 10px;
          margin-top: 10px;
          border-top: 1px solid var(--divider-color);
        }
      }
      h4 {
        margin: 0 0 6px 0;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }

      /* Label and value, lined up down the column */
      .facts {
        display: grid;
        grid-template-columns: max-content minmax(0, 1fr);
        gap: 2px 10px;
        align-items: baseline;
      }
      .factlabel {
        color: var(--secondary-text-color);
        font-size: 13px;
        white-space: nowrap;
      }
      /* The value after each label: the same size as the label, and bold, so
         each line reads as one thing with the answer standing out. The values
         used to be the page's own 16px beside 13px labels, with the ids in a
         13px monospace in between - three sizes on four lines. */
      .factvalue {
        min-width: 0;
        overflow-wrap: break-word;
        font-size: 13px;
        font-weight: 600;
      }
      /* A remark inside a value - "icon _0x85" - stays a remark */
      .factvalue .factlabel {
        font-weight: normal;
      }
      .mono {
        font-family: ui-monospace, "Roboto Mono", monospace;
        font-size: 13px;
      }
      .note {
        color: var(--secondary-text-color);
        font-size: 12px;
        line-height: 16px;
        margin-top: 8px;
      }
      .warning {
        color: var(--error-color, #db4437);
        font-size: 12px;
        line-height: 16px;
        margin-top: 6px;
      }

      #copyres, .iconbutton {
        cursor: pointer;
        color: var(--secondary-text-color);
        vertical-align: middle;
      }
      #copyres:hover, .iconbutton:hover {
        color: var(--primary-color);
      }

      /* The two things that can be changed here. A field that is not being
         edited is drawn as plain text - the row only turns into a form once
         it is being used. */
      .editrow {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      /* Same size as the values beside it, but not bold: text being edited
         is read letter by letter, and bold makes that harder */
      input {
        font: inherit;
        font-size: 13px;
        font-weight: normal;
        min-width: 0;
        flex: 1 1 auto;
        padding: 3px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      /* Whether what was typed is on its way or has landed. Both fields save
         themselves, so this is the only thing that says so. */
      .status {
        flex: 0 0 auto;
        font-size: 12px;
        font-weight: normal;
        color: var(--secondary-text-color);
      }
      .status.saved {
        color: var(--primary-color);
      }
      .linkbutton {
        background: none;
        border: none;
        box-shadow: none;
        color: var(--secondary-text-color);
        padding: 2px 4px;
        font-size: 13px;
        font-weight: normal;
        cursor: pointer;
      }
      .linkbutton:hover {
        color: var(--primary-color);
      }

      /* The buttons that add the resource to Home Assistant. Outlined pills
         like the tabs and the reload button rather than the filled ones the
         dialogs use - a panel with two kinds of button reads as two panels,
         and a filled block of colour down here drew the eye before the thing
         it describes did.
         Each with what it does written beneath it - one under the other in
         the column, side by side when adding (see #sections.adding). With one
         paragraph under all three, the reader had to work out which sentence
         belonged to which button. */
      .actionlist {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .action .note {
        margin-top: 4px;
      }
      /* The note that goes for all of them, set off by a line: with the
         buttons side by side it otherwise read as one more button's text */
      .note.general {
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
        margin-top: 12px;
      }
      .actionlist button {
        background-color: transparent;
        box-shadow: none;
        border: 1px solid var(--primary-color);
        border-radius: 16px;
        color: var(--primary-color);
        font-size: 14px;
        padding: 4px 14px;
      }
      .actionlist button:hover {
        background-color: var(--secondary-background-color);
      }
      /* Taking something away is not the same as adding it */
      .actionlist button.remove {
        border-color: var(--error-color, #db4437);
        color: var(--error-color, #db4437);
      }
      /* On an input, the two platforms that write to the controller are drawn
         in grey rather than in the theme colour - they are still worth having,
         but on a button they are not the obvious answer.
         In the secondary text colour, not the divider colour: the divider is
         barely visible in a theme like Graphite, and a button whose outline
         cannot be seen does not look like a button at all. The difference is
         carried by the line under it, not by taking the edge away. */
      .actionlist button.writes {
        border-color: var(--secondary-text-color);
        color: var(--secondary-text-color);
      }
      .actionlist button.writes:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
      .valueactions {
        display: inline-flex;
        gap: 4px;
        margin-left: 6px;
      }
      .valueactions span {
        font-size: 11px;
        font-weight: bold;
        padding: 1px 8px;
        cursor: pointer;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
      }
      .valueactions span:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    `];
  }

  render() {
    if (this.working)
      return html`
        <div id="working">
          <ihc-loader></ihc-loader>
          <div>${localize("working_update")}</div>
        </div>`;
    if (this.isLoading)
      return html`<ihc-loader/>`;
    if (this.selected == null)
      return '';
    return html`
      ${this.renderHead()}
      <div id="sections" class="${this.canAdd() ? "adding" : ""}">
        <section>
          <h4>${localize("sec_ihc")}</h4>
          <div class="facts">${this.renderIhcFacts()}</div>
        </section>
        <section>
          <h4>${localize("sec_hass")}</h4>
          ${this.renderHass()}
        </section>
        <section>
          <h4>${localize(this.canAdd() ? "sec_add" : "sec_actions")}</h4>
          ${this.renderActions()}
        </section>
      </div>
      <ihc-binary-res-dlg id="binary-dlg" @ok=${this.makeBinarySensor}></ihc-binary-res-dlg>
      <ihc-resource-dlg id="light-dlg" @ok=${this.makeLight} title="${localize("dlg_light_title")}"></ihc-resource-dlg>
      <ihc-resource-dlg id="switch-dlg" @ok=${this.makeSwitch} title="${localize("dlg_switch_title")}"></ihc-resource-dlg>
      <ihc-sensor-res-dlg id="sensor-dlg" @ok=${this.makeSensor}></ihc-sensor-res-dlg>
      <ihc-remove-dlg id="remove-dlg" @ok=${this.doRemove}></ihc-remove-dlg>
      `;
  }

  renderHead() {
    const data: any = this.selectednode?.data;
    const detail = [data?.Position, data?.Note].filter((part) => part).join(" · ");
    return html`
      <div id="head">
        <ha-icon class="headicon" .icon=${this.selectednode?.icon() || "mdi:circle-small"}></ha-icon>
        <span class="headname">${data?.Name}</span>
        ${detail ? html`<span class="headsub">${detail}</span>` : ""}
        <span class="spacer"></span>
        <ha-icon id="close" icon="mdi:close" title="${localize("prop_close")}"
          @click=${this.onClose}></ha-icon>
      </div>`;
  }

  // What the ihc project and the controller say. None of it can be changed
  // from here - it is the installation, not our idea of it.
  renderIhcFacts() {
    const product = this.selectednode?.data?.Product;
    return html`
      <span class="factlabel">${localize("prop_resource_id")}</span>
      <span class="factvalue">
        <span class="mono">${this.selected.id}</span>
        <span id="copyres" title="${localize("prop_copy_title")}" @click=${this.onCopy}>
          <svg style="width: 16px; height: 16px" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
          </svg>
        </span>
      </span>
      <span class="factlabel">${localize("prop_type")}</span>
      <span class="factvalue">${this.selected.type}</span>
      <span class="factlabel" title="${localize("prop_value_title")}">${localize("prop_value")}</span>
      <span class="factvalue">${`${this.selected.value}`}${this.renderValueActions()}</span>
      ${product ? html`
        <span class="factlabel">${localize("prop_product")}</span>
        <span class="factvalue">${product.Name}</span>
        <span class="factlabel">${localize("prop_product_type")}</span>
        <span class="factvalue">
          <span class="mono">${product.ProductIdentifier}</span>
          ${product.IhcIcon ? html`<span class="factlabel"> ${localize("prop_ihc_icon", product.IhcIcon)}</span>` : ""}
          ${hasProductIcon(product) ? "" : html`<span class="factlabel"> · ${localize("prop_product_no_icon")}</span>`}
        </span>` : ""}`;
  }

  // What the resource is in Home Assistant - and the two things about it that
  // can be changed without a restart. Both live in the entity registry, which
  // keeps them across a restart and puts them back when the ihc integration is
  // reloaded and the entities are built again.
  renderHass() {
    // Set up, but not an entity yet. Only seen when putting the change into
    // effect did not go through - the header then offers to try again.
    if (this.selected.entity_id && !isEntityId(this.selected.entity_id)) {
      return html`<div class="note">${localize("not_updated_yet")}</div>`;
    }
    if (!this.selected.entity_id) {
      return html`<div class="note">${localize("not_in_hass")}</div>
        ${this.canAdd() ? html`
          <div class="note">${localize("not_in_hass_how")}</div>` : ""}
        ${this.selected.pending_removal ? html`
          <div class="note">${localize("pending_removal_help")}</div>` : ""}`;
    }
    return html`
      <div class="facts">
        <span class="factlabel">${localize("prop_display_name")}</span>
        <span class="factvalue">${this.renderNameField()}</span>
        <span class="factlabel">${localize("prop_entity")}</span>
        <span class="factvalue">${this.renderEntityIdField()}</span>
      </div>
      ${this.renameError ? html`<div class="warning">${localize(this.renameError)}</div>` : ""}
      ${this.isBinarySensor() ? html`<div class="note">${localize("binary_sensor_help")}</div>` : ""}`;
  }

  // Nothing here has a Save button. What is typed is saved on its own - the
  // name a moment after the typing stops, and both fields as soon as the
  // field is left or Enter is pressed. So the status beside the field is the
  // only thing that says whether it went through.
  renderNameField() {
    return html`
      <div class="editrow">
        <input id="namefield" type="text" .value=${this.nameDraft}
          placeholder="${localize("name_placeholder")}"
          title="${localize("prop_display_name_title")}"
          @input=${this.onNameInput}
          @change=${() => this.saveName()}
          @keydown=${(e) => { if (e.key === "Enter") e.target.blur(); }}>
        ${this.renderStatus("name")}
      </div>`;
  }

  renderEntityIdField() {
    if (!this.editingEntityId) {
      return html`
        <div class="editrow">
          <span class="mono factvalue">${this.selected.entity_id}</span>
          <ha-icon class="iconbutton" icon="mdi:pencil" title="${localize("rename_edit_id")}"
            @click=${this.startEditEntityId}></ha-icon>
          ${this.renderStatus("entity")}
        </div>`;
    }
    // The entity id is not saved while it is being typed. Half of one is
    // never a valid id, and every keystroke would be refused on the way to
    // the one that is not - so this one waits until the field is left.
    return html`
      <div class="editrow">
        <input id="entityfield" class="mono" type="text" .value=${this.entityDraft}
          @input=${(e) => { this.entityDraft = e.target.value; }}
          @change=${() => this.saveEntityId()}
          @keydown=${this.onEntityKey}>
        <button class="linkbutton" @mousedown=${this.cancelEditEntityId}>${localize("rename_cancel")}</button>
      </div>
      <div class="warning">${localize("entity_id_warning")}</div>`;
  }

  // Saving, saved, or nothing. It sits beside the field it belongs to, so
  // two fields do not share one message.
  renderStatus(field: string) {
    if (this.saving === field) return html`<span class="status"><ihc-loader small></ihc-loader> ${localize("rename_saving")}</span>`;
    if (this.savedNow === field) return html`<span class="status saved">${localize("rename_saved")}</span>`;
    return "";
  }

  // Whether anything can be added at all. The heading over the buttons says
  // so too: "Actions" is true and tells you nothing, and when the resource is
  // not in Home Assistant yet, adding it is the only thing there is to do.
  canAdd(): boolean {
    return this.action_binary_sensor || this.action_light
      || this.action_sensor || this.action_switch;
  }

  renderActions() {
    const canAdd = this.canAdd();
    return html`
      <div class="actionlist">
        ${this.action_binary_sensor ? this.addAction("binary-dlg", "binary_sensor") : ""}
        ${this.action_light ? this.addAction("light-dlg", "light") : ""}
        ${this.action_sensor ? this.addAction("sensor-dlg", "sensor") : ""}
        ${this.action_switch ? this.addAction("switch-dlg", "switch") : ""}
        ${this.selected?.manual ? html`
          <div class="action">
            <button class="remove" @click=${this.removeManual}>${localize("remove_manual")}</button>
            <div class="note">${localize("manual_help")}</div>
          </div>` : ""}
      </div>
      ${this.changeError ? html`<div class="warning">${localize(this.changeError)}</div>` : ""}
      ${canAdd ? html`<div class="note general">${localize("add_help")}</div>` : ""}
      ${!canAdd && !this.selected?.manual && this.selected?.entity_id ? html`
        <div class="note">${localize("automatic_help")}</div>` : ""}`;
  }

  // One button with what it does written underneath. The three used to sit in
  // a row with a single paragraph under all of them, and the reader was left
  // to work out which sentence belonged to which button.
  addAction(dialog: string, platform: string) {
    const writes = platform === "light" || platform === "switch";
    const marked = writes && this.isInput();
    return html`
      <div class="action">
        <button class="${marked ? "writes" : ""}"
          @click=${() => { this.showDialog(dialog) }}>${platformLabel(platform)}</button>
        <div class="note">${localize(`add_${platform}_help`)}</div>
        ${marked ? html`<div class="note">${localize("add_writes_input")}</div>` : ""}
      </div>`;
  }

  renderValueActions() {

    if (this.selected.type == 'bool') {
      return html`<span class="valueactions">
        <span @click=${this.runtimeBoolOn} title="${localize("value_on_title")}">${localize("value_on")}</span>
        <span @click=${this.runtimeBoolOff} title="${localize("value_off_title")}">${localize("value_off")}</span>
        <span @click=${this.runtimeBoolToggle} title="${localize("value_toggle_title")}">${localize("value_toggle")}</span>
      </span>`;
    }
    return '';
  }


  constructor() {
    super();
    this.isLoading = false;
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  isBinarySensor(): boolean {
    return `${this.selected?.entity_id}`.split(".")[0] === "binary_sensor";
  }

  // A resource that points inwards - a button, a contact. It is read, not
  // set. The panel decides what can be added from the runtime type alone, so
  // an input is offered the same three platforms as an output; the project
  // knows the difference, and this is where it is used.
  isInput(): boolean {
    return this.selectednode?.data instanceof IHCInput;
  }

  // One of the buttons that adds the resource to Home Assistant. A platform
  // that writes to the controller is marked when the resource is an input -
  // there, turning it on means telling the controller the button was pressed.
  onClose() {
    this.dispatchEvent(new CustomEvent("closeproperties", {
      bubbles: true, composed: true,
    }));
  }

  async setSelected(selectednode: IhcTreeNode, onid = null, offid = null) {
    this.on_id = onid;
    this.off_id = offid;
    if (selectednode == null) {
      this.selected = null;
      this.selectednode = null;
      return;
    }
    if (selectednode !== this.selectednode) this.changeError = "";
    this.selectednode = selectednode;
    let selectedid = selectednode.data.Id
    this.isLoading = true;
    this.action_binary_sensor = false;
    this.action_light = false;
    this.action_sensor = false;
    this.action_switch = false
    let response = await IHCManager.instance.fetchWithAuth(
      `/api/ihcviewer/getresource/${this.controllerId}/${selectedid}`);
    if (response.ok) {
      this.selected = await response.json();
      if (this.selected != null && this.selected.type && !this.selected.entity_id) {
        switch (this.selected.type) {
          case 'bool':
            this.action_binary_sensor = onid == null;
            this.action_light = true;
            this.action_switch = true
            break;
          case 'int':
            this.action_light = (<IHCResource>this.selectednode.data).IsLightLevel;
            this.action_sensor = onid == null;
            break;
          case 'time':
          case 'float':
            this.action_sensor = true;
            break;
        }
      }
      this.resetEditing();
    }
    this.isLoading = false;
  }

  // The fields start over on whatever is selected now. Without this, a name
  // half typed on one resource would still be sitting in the field when the
  // next one is picked - and it saves itself, so it would be written there.
  resetEditing() {
    clearTimeout(this.nameTimer);
    this.nameTimer = null;
    this.savedName = this.selected?.state?.attributes?.friendly_name || "";
    this.nameDraft = this.savedName;
    this.entityDraft = this.selected?.entity_id || "";
    this.editingEntityId = false;
    this.renameError = "";
    this.savedNow = "";
  }

  // Saved a moment after the typing stops rather than on every keystroke -
  // and at once when the field is left, so nothing is lost by clicking away.
  onNameInput(event) {
    this.nameDraft = event.target.value;
    clearTimeout(this.nameTimer);
    this.nameTimer = setTimeout(() => this.saveName(), 800);
  }

  onEntityKey(event) {
    if (event.key === "Enter") event.target.blur();
    if (event.key === "Escape") this.cancelEditEntityId();
  }

  startEditEntityId() {
    this.entityDraft = this.selected.entity_id;
    this.renameError = "";
    this.editingEntityId = true;
    this.updateComplete.then(() => {
      const field = this.shadowRoot.getElementById("entityfield") as HTMLInputElement;
      if (field) field.focus();
    });
  }

  // On mousedown rather than click: leaving the field fires change first, and
  // by the time a click lands the id has already been saved.
  cancelEditEntityId() {
    this.entityDraft = this.selected.entity_id;
    this.renameError = "";
    this.editingEntityId = false;
  }

  async saveName() {
    clearTimeout(this.nameTimer);
    this.nameTimer = null;
    if (this.nameDraft === this.savedName) return;
    const result = await this.rename("name", { name: this.nameDraft });
    if (!result) return;
    // What was typed stays in the field. Home Assistant writes the new name
    // onto the entity's state a moment after the registry has it, so reading
    // the state back here would show the old one for a tick.
    this.savedName = this.nameDraft;
  }

  async saveEntityId() {
    const wanted = this.entityDraft.trim().toLowerCase();
    if (!wanted || wanted === this.selected.entity_id) {
      this.cancelEditEntityId();
      return;
    }
    const result = await this.rename("entity", { new_entity_id: wanted });
    if (!result) return;
    this.selected.entity_id = result.entity_id;
    this.entityDraft = result.entity_id;
    this.editingEntityId = false;
    this.requestUpdate();
  }

  // Both fields go the same way, so an error comes back the same way too: a
  // key the panel can say in the user's own language rather than whatever
  // Home Assistant would have put in the log.
  async rename(field: string, changes) {
    this.saving = field;
    this.renameError = "";
    let result = null;
    try {
      const response = await IHCManager.instance.fetchWithAuth(
        `/api/ihcviewer/entity/${this.controllerId}`, {
        method: "POST",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: this.selected.id,
          entity_id: this.selected.entity_id,
          ...changes,
        }),
      });
      const body = await response.json();
      if (response.ok) {
        result = body;
      } else {
        this.renameError = body?.error || "rename_failed";
      }
    } catch (err) {
      this.renameError = "rename_failed";
    }
    this.saving = "";
    if (result) {
      this.savedNow = field;
      clearTimeout(this.savedTimer);
      this.savedTimer = setTimeout(() => { this.savedNow = ""; }, 2500);
    }
    return result;
  }

  showDialog(id) {

    var dlg = this.shadowRoot.getElementById(id) as IhcResourceDialog
    dlg.controllerId = this.controllerId;
    dlg.ihc_id = this.selected.id;
    dlg.on_id = this.on_id;
    dlg.off_id = this.off_id;
    // The name is what Home Assistant builds the entity id from, so the
    // dialog shows what the one being typed will turn into
    dlg.domain = this.dialogDomain(id);
    dlg.suggestedName = this.suggestedName();
    dlg.open();
  }

  // What the name field in the add dialog starts out as - see suggestName
  suggestedName(): string {
    return suggestName(this.selectednode?.data);
  }

  dialogDomain(id: string): string {
    switch (id) {
      case "binary-dlg": return "binary_sensor";
      case "light-dlg": return "light";
      case "sensor-dlg": return "sensor";
      case "switch-dlg": return "switch";
    }
    return "";
  }

  // Add or remove, and wait for it to take effect. The api puts the change
  // into Home Assistant itself - it reloads the ihc integration - so when the
  // call returns, the entity is there, or gone. Nothing is left to press, and
  // nothing needs a restart.
  //
  // Before this only two of the five told the panel a reload was needed, and
  // then only by showing a button: after Light, Switch or Sensor there was no
  // button at all, and no way to see how to make the entity appear.
  async change(url: string, data) {
    this.working = true;
    this.changeError = "";
    let result = null;
    try {
      const response = await IHCManager.instance.fetchWithAuth(url, {
        method: "POST",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      result = await response.json();
      if (!response.ok) this.changeError = result?.error || "change_failed";
    } catch (e) {
      this.changeError = "change_failed";
    }
    // The tree, its badges and this pane all read the mapping, and the reload
    // has made it stale - so the controller reads everything again, and the
    // ring stays until it has. reloaded is false only when the change was
    // saved but could not be put into effect.
    const wait: Promise<any>[] = [];
    this.dispatchEvent(new CustomEvent("changed", {
      bubbles: true,
      composed: true,
      detail: { reloaded: result?.reloaded, wait },
    }));
    await Promise.all(wait);
    this.working = false;
  }

  async makeBinarySensor() {
    const dlg = this.shadowRoot.getElementById('binary-dlg') as IhcBinaryResourceDialog;
    await this.change(`/api/ihcviewer/manual/binarysensor/${this.controllerId}`, {
      id: dlg.ihc_id,
      name: dlg.name,
      type: dlg.type,
      inverted: dlg.inverted,
    });
  }

  // A light on a number is a light level, and only dims if it is written as
  // dimmable - see make_light
  async makeLight() {
    const dlg = this.shadowRoot.getElementById('light-dlg') as IhcResourceDialog;
    await this.change(`/api/ihcviewer/manual/light/${this.controllerId}`,
      this.withOnOff(dlg, {
        id: dlg.ihc_id, name: dlg.name, dimmable: this.selected?.type === "int",
      }));
  }

  async makeSwitch() {
    const dlg = this.shadowRoot.getElementById('switch-dlg') as IhcResourceDialog;
    await this.change(`/api/ihcviewer/manual/switch/${this.controllerId}`,
      this.withOnOff(dlg, { id: dlg.ihc_id, name: dlg.name }));
  }

  async makeSensor() {
    const dlg = this.shadowRoot.getElementById('sensor-dlg') as IhcSensorResourceDialog;
    await this.change(`/api/ihcviewer/manual/sensor/${this.controllerId}`, {
      id: dlg.ihc_id,
      name: dlg.name,
      unit: dlg.unit,
    });
  }

  // The separate on and off resources, when the resource was picked with them
  withOnOff(dlg: IhcResourceDialog, data) {
    if (dlg.on_id != null) data["on_id"] = dlg.on_id;
    if (dlg.off_id != null) data["off_id"] = dlg.off_id;
    return data;
  }

  // Asks first, and shows what uses the entity - removing cannot be undone,
  // see ihc-remove-dlg
  removeManual() {
    const dlg = this.shadowRoot.getElementById("remove-dlg") as IhcRemoveDialog;
    dlg.open(this.selected.entity_id, this.savedName || this.selectednode?.data?.Name);
  }

  async doRemove() {
    await this.change(
      `/api/ihcviewer/manual/remove/${this.controllerId}/${this.selected.id}`, {});
  }

  async runtimeBoolOn() {

    var id = this.selected.id;
    if ((await this.apiRequest(`/api/ihcviewer/setboolresource/${this.controllerId}/${id}/on`, '', 'POST')) == 'on') {
      this.selected.value = true;
      this.requestUpdate();
    }
  }

  async runtimeBoolOff() {

    var id = this.selected.id;
    if ((await this.apiRequest(`/api/ihcviewer/setboolresource/${this.controllerId}/${id}/off`, '', 'POST')) == 'off') {
      this.selected.value = false;
      this.requestUpdate();
    }
  }

  async runtimeBoolToggle() {

    var id = this.selected.id;
    await this.apiRequest(`/api/ihcviewer/setboolresource/${this.controllerId}/${id}/toggle`, '', 'POST');
  }

  async apiRequest(url: string, data, method: string = "GET") {

    let response = await IHCManager.instance.fetchWithAuth(url, {
      method: method,
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      return await response.text();
    }
    return "error";
  }

  onCopy() {
    copyTextToClipboard(this.selected.id);
  }
}
