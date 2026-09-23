import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localize } from "../localize";
import { slugify } from "../logic";


// Base class for all resource dialogs
@customElement("ihc-resource-dlg")
export class IhcResourceDialog extends LitElement {

  @property({ type: String, attribute: false })
  public controllerId: string;

  @property({ type: Number, attribute: false })
  public ihc_id: number;

  @property({ type: Number, attribute: false })
  public on_id: number;

  @property({ type: Number, attribute: false })
  public off_id: number;

  @property({ type: String })
  public title: string;

  @property({ type: String, attribute: false })
  public name: string;

  // What the entity will be: the part before the dot, and the name the ihc
  // project has for the resource. The name is what Home Assistant builds the
  // rest of the entity id from, so it is filled in from the start and shown
  // as the entity id it turns into.
  @property({ type: String, attribute: false })
  public domain: string = "";

  @property({ type: String, attribute: false })
  public suggestedName: string = "";

  @property({ type: String, attribute: false })
  public nameDraft: string = "";

  static get button_style() {
    return css`
      button {
        /* A button does not inherit the font - the browser gives it its own -
           so without this the panel is in the theme's font everywhere except
           the places you click and type */
        font: inherit;
        border-radius: 4px;
        background-color: var(--mdc-theme-primary, #6200ee);
        color: var(--mdc-theme-on-primary, #fff);
        padding: 5px 10px 5px 10px;
        border: none;
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
      }`;
  }

  static get styles() {
    return [
      IhcResourceDialog.button_style,
      css`
      /* Both are fixed to the window, not to whatever is around them. They
         used to be absolute, which anchors them to the nearest positioned
         ancestor - the properties pane - and that pane is now a box with its
         own scrollbar. A box that scrolls clips what sticks out of it, so the
         dialog came up cut in half with the buttons outside the visible part. */
      #dlgmask {
        display:none;
        position: fixed;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        z-index: 8000;
        background-color: #80808080;
      }
      .dlg {
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 8001;
        box-sizing: border-box;
        max-width: 90vw;
        max-height: 85vh;
        overflow-y: auto;
        padding: 20px 24px;
        /* The same card as everything else in the panel, rather than a grey
           box with a two pixel border */
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-card-border-radius, 12px);
        background-color: var(--card-background-color, #fff);
        box-shadow: var(--ha-card-box-shadow,
          0px 8px 10px -5px rgba(0, 0, 0, .2),
          0px 16px 24px 2px rgba(0, 0, 0, .14),
          0px 6px 30px 5px rgba(0, 0, 0, .12));
      }
      /* Same for the fields - see the note on button above */
      input,
      select {
        font: inherit;
        font-size: 14px;
        padding: 6px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 18px;
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      input:focus,
      select:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      input[type="checkbox"] {
        padding: 0;
      }
      /* The fields fill the dialog. The name box was size="30" - a fixed
         thirty characters - while the list beside it filled the width, so
         the two did not line up and a long suggested name was cut off
         halfway with empty dialog to the right of it. */
      .control-row input[type="text"],
      .control-row select {
        width: 100%;
        box-sizing: border-box;
      }
      label {
        padding-left: 6px;
      }
      .dlgtitle {
        font-size: 18px;
        font-weight: 500;
        padding-bottom: 12px;
      }
      .coloumn {
        display: flex;
        flex-direction: column;
        width: fit-content;
      }
      .row {
        display: flex;
        flex-direction: row;
      }
      .control-row {
        display: block;
        padding-bottom: 12px;
      }
      /* The label above its field, so a name field wide enough to type in
         does not push the dialog sideways */
      .control-row > div {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding-bottom: 4px;
      }
      .buttonrow {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 8px;
      }
      .buttonrow button {
        min-width: 6em;
      }
      /* What the name turns into. Home Assistant makes the entity id out of
         the name when the entity is created, and after that the two live
         apart - so this is the one moment where the name decides it. */
      .entitypreview {
        font-family: ui-monospace, "Roboto Mono", monospace;
        font-size: 12px;
        color: var(--secondary-text-color);
        padding-top: 4px;
      }
    `];
  }

  render() {
    return html`
      <div id="dlgmask"></div>
      <div id="dlg" class="dlg">
        <div class="dlgtitle">${this.title}</div>
        <div class="coloumn">
          <div class="control-row">
            <div>${localize("dlg_resource_id", this.ihc_id)}</div>
          </div>
          ${this.on_id ? html`
            <div class="control-row">
              <div>on_id: ${this.on_id}</div>
            </div>
          `: ''}
          ${this.off_id ? html`
            <div class="control-row">
              <div>off_id: ${this.off_id}</div>
            </div>
          `: ''}
          <div class="control-row">
            <div>${localize("dlg_name")}</div>
            <input id="name" type="text" .value=${this.nameDraft}
              @input=${(e) => { this.nameDraft = e.target.value; }}/>
            ${this.domain ? html`
              <div class="entitypreview">${localize("dlg_entity_id_becomes", this.entityIdPreview())}</div>
            ` : ''}
          </div>
          ${this.render_controls()}
          <slot></slot>
        </div>
        <div class="buttonrow">
            <button @click=${this.onOk}>${localize("dlg_ok")}</button>
            <button @click="${this.onCancel}">${localize("dlg_cancel")}</button>
          </div>
      </div>
    `;
  }

  // Derived classes will overwrite this to add more
  render_controls() {
    return html``;
  }

  // What Home Assistant will call the entity. It slugifies the name: small
  // letters, underscores instead of anything else, and the accented letters
  // written out - so a Danish name comes back readable rather than stripped.
  entityIdPreview(): string {
    const slug = slugify(this.nameDraft);
    // Just the domain and the dot while the field is empty. The placeholder
    // used to be "..." after a dot the template already wrote, so an empty
    // name read "binary_sensor...." - four dots, which looks like a fault
    // rather than like a part that is still missing.
    return `${this.domain}.${slug}`;
  }

  open() {
    // The dialog element stays around between openings, so the field is set
    // here rather than in firstUpdated - otherwise it would keep whatever was
    // typed the last time it was used.
    this.nameDraft = this.suggestedName || "";
    this.shadowRoot.getElementById("dlgmask").style.display = 'block';
    this.shadowRoot.getElementById("dlg").style.display = 'block';
    this.updateComplete.then(() => {
      const field = this.shadowRoot.getElementById("name") as HTMLInputElement;
      if (!field) return;
      field.focus();
      // Selected rather than just filled in: the suggestion is a starting
      // point, and typing should replace it without having to clear it first.
      field.select();
    });
  }

  close() {
    this.shadowRoot.getElementById("dlgmask").style.display = 'none';
    this.shadowRoot.getElementById("dlg").style.display = 'none';
  }

  async onOk() {
    this.name = (<HTMLInputElement>this.shadowRoot.getElementById("name")).value.trim()
    if (this.name == "") {
      alert(localize("dlg_name_required"));
      return;
    }
    this.close();
    this.dispatchEvent(new CustomEvent('ok'));
  }

  onCancel() {
    this.close();
  }
}

