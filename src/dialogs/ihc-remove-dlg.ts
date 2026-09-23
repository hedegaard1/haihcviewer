import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { IhcResourceDialog } from "./ihc-resource-dlg";
import { IHCManager } from "../ihcmanager";
import { localize } from "../localize";
import { entityMentioned, isEntityId, usedBy } from "../logic";

require("../elements/loader-element");

// Asks before a manual setup is removed, and says what in Home Assistant uses
// the entity. Removing is final: the entity leaves the registry, and Home
// Assistant's own copy of it goes too, so its entity id, area and labels do
// not come back if the resource is added again.
@customElement("ihc-remove-dlg")
export class IhcRemoveDialog extends LitElement {

  @property({ type: String, attribute: false })
  public entityId = "";

  @property({ type: String, attribute: false })
  public name = "";

  // What uses the entity, as [kind, names], once it has been looked up
  @property({ attribute: false })
  public uses: [string, string[]][] = [];

  @property({ type: Boolean, attribute: false })
  public checking = false;

  @property({ type: Boolean, attribute: false })
  public lookupFailed = false;

  static get styles() {
    return IhcResourceDialog.styles.concat(css`
      .coloumn {
        width: 30em;
        max-width: 80vw;
      }
      .lead {
        padding-bottom: 4px;
      }
      .entity {
        font-family: ui-monospace, "Roboto Mono", monospace;
        font-size: 12px;
        color: var(--secondary-text-color);
        padding-bottom: 12px;
      }
      .checking {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--secondary-text-color);
        padding-bottom: 8px;
      }
      .warning {
        color: var(--error-color, #db4437);
        padding-bottom: 4px;
      }
      .kind {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        padding-top: 8px;
      }
      ul {
        margin: 2px 0 0 0;
        padding-left: 20px;
      }
      .hint {
        font-size: 12px;
        line-height: 16px;
        color: var(--secondary-text-color);
        padding-top: 8px;
      }
      /* Taking something away, in the colour the panel's own remove button has */
      button.danger {
        background-color: var(--error-color, #db4437);
      }
      button:disabled {
        opacity: .5;
      }
    `);
  }

  render() {
    return html`
      <div id="dlgmask"></div>
      <div id="dlg" class="dlg">
        <div class="dlgtitle">${localize("remove_dlg_title")}</div>
        <div class="coloumn">
          <div class="lead">${localize("remove_dlg_text", this.name)}</div>
          ${isEntityId(this.entityId) ? html`<div class="entity">${this.entityId}</div>` : ""}
          ${this.renderUses()}
        </div>
        <div class="buttonrow">
          <button class="danger" ?disabled=${this.checking}
            @click=${this.onOk}>${localize("remove_dlg_ok")}</button>
          <button @click=${this.onCancel}>${localize("dlg_cancel")}</button>
        </div>
      </div>`;
  }

  renderUses() {
    // Set up, but never an entity - nothing can be using it
    if (!isEntityId(this.entityId)) return "";
    if (this.checking) {
      return html`<div class="checking"><ihc-loader small></ihc-loader>${localize("remove_dlg_checking")}</div>`;
    }
    if (this.lookupFailed) {
      return html`<div class="hint">${localize("remove_dlg_lookup_failed")}</div>`;
    }
    return html`
      ${this.uses.length ? html`
        <div class="warning">${localize("remove_dlg_used")}</div>
        ${this.uses.map(([kind, names]) => html`
          <div class="kind">${localize(`used_${kind}`)}</div>
          <ul>${names.map((name) => html`<li>${name}</li>`)}</ul>`)}
      ` : html`<div>${localize("remove_dlg_unused")}</div>`}
      <div class="hint">${localize("remove_dlg_not_checked")}</div>`;
  }

  // Opens at once, and looks up what uses the entity while it is open. The
  // remove button waits for the answer - seeing it is the point of asking.
  async open(entityId: string, name: string) {
    this.entityId = entityId || "";
    this.name = name || this.entityId;
    this.uses = [];
    this.lookupFailed = false;
    this.checking = isEntityId(this.entityId);
    this.shadowRoot.getElementById("dlgmask").style.display = 'block';
    this.shadowRoot.getElementById("dlg").style.display = 'block';
    if (!this.checking) return;
    const asked = this.entityId;
    let uses = [];
    let failed = false;
    try {
      uses = await this.lookUp(asked);
    } catch (err) {
      failed = true;
    }
    // Closed and opened on another entity while this one was being looked up
    if (this.entityId !== asked) return;
    this.uses = uses;
    this.lookupFailed = failed;
    this.checking = false;
  }

  async lookUp(entityId: string): Promise<[string, string[]][]> {
    const hass = IHCManager.instance.hass;
    const [related, dashboards] = await Promise.all([
      hass.callWS({ type: "search/related", item_type: "entity", item_id: entityId }),
      this.dashboardsUsing(hass, entityId),
    ]);
    // By the name Home Assistant shows, not the id - an automation is known
    // by what it is called
    const named = (ids: string[]) => ids
      .map((id) => hass.states[id]?.attributes?.friendly_name || id)
      .sort((a, b) => a.localeCompare(b));
    const uses = usedBy(related).map(([kind, ids]) => [kind, named(ids)] as [string, string[]]);
    if (dashboards.length) uses.push(["dashboard", dashboards]);
    return uses;
  }

  // search/related does not look in dashboards, so each one is read and
  // searched for the entity id. One that Home Assistant draws by itself has no
  // config to read, and cannot hold on to an entity that is gone anyway.
  async dashboardsUsing(hass, entityId: string): Promise<string[]> {
    const listed = await hass.callWS({ type: "lovelace/dashboards/list" });
    // The default dashboard is in the list as "lovelace" in core 2026.9. An
    // older Home Assistant leaves it out, and it is asked for with no url path
    // - adding it both ways named it twice.
    const dashboards = listed.some((dashboard) => dashboard.url_path === "lovelace")
      ? listed
      : [{ url_path: null, title: hass.localize("panel.states") || "Overview" }].concat(listed);
    const found = await Promise.all(dashboards.map(async (dashboard) => {
      try {
        const config = await hass.callWS({ type: "lovelace/config", url_path: dashboard.url_path });
        return entityMentioned(config, entityId) ? dashboard.title : null;
      } catch (err) {
        return null;
      }
    }));
    return found.filter((title) => title);
  }

  close() {
    this.shadowRoot.getElementById("dlgmask").style.display = 'none';
    this.shadowRoot.getElementById("dlg").style.display = 'none';
  }

  onOk() {
    this.close();
    this.dispatchEvent(new CustomEvent('ok'));
  }

  onCancel() {
    this.close();
  }
}
