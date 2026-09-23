import { customElement, property } from 'lit/decorators.js';
import { haStyle } from "../../homeassistant-frontend/src/resources/styles"

import { IHCProject, IHCResource } from "../ihcproject";
import { IhcIconDialog } from "../dialogs/ihc-icon-dlg";
import { IhcPropertiesElement } from "./ihc-properties-element"
import { IhcTreeNode, Selection } from "./ihc-tree-node"
import { IHCManager } from "../ihcmanager";
import { filterGroups, platformOf } from "../logic";
import { localize } from "../localize";
import { LitElement, css, html } from 'lit';

require("../dialogs/ihc-icon-dlg");
require("./ihc-log-element");
require("./ihc-properties-element");
require("./ihc-tree-node");
require("./loader-element");

@customElement("ihc-controller")
export class IhcControllerElement extends LitElement {

  private ihcmapping;
  //  @property({ attribute: false })
  private ihcproject: IHCProject;

  @property({ type: Boolean, attribute: true })
  public show;

  @property({ type: String, attribute: true })
  public controllerId;

  @property({ type: Boolean, attribute: false })
  public isProjectLoading = false;

  // What went wrong the last time the project was loaded, if anything
  @property({ type: String, attribute: false })
  public loadError = null;

  // What the controller says about itself and about the project it is running
  @property({ type: Object, attribute: false })
  public systemInfo = null;

  @property({ type: Object, attribute: false })
  public projectInfo = null;

  // The icons picked for the rooms, keyed by the room's ihc id
  @property({ type: Object, attribute: false })
  public groupIcons = null;

  @property({ type: Object, attribute: false })
  public selected = null;

  @property({ type: Object, attribute: false })
  public onselected = null;

  @property({ type: Object, attribute: false })
  public offselected = null;

  // Selected tab index 0=Project, 1=Log
  @property({ type: Number, attribute: false })
  public selectedtab;

  // What is typed in the search, which product type is picked, and how many
  // resources are left - the last one so the bar can say whether a search
  // that shows nothing found nothing, or found something out of sight.
  @property({ type: String, attribute: false })
  public filterText = "";

  @property({ type: String, attribute: false })
  public filterProduct = "";

  @property({ type: Number, attribute: false })
  public filterHits = 0;

  static get styles() {
    return [
      haStyle,
      css`
      /* No height anywhere below, on purpose. Home Assistant hands a panel a
         box with no height of its own - .mdc-drawer-app-content in ha-drawer
         sets width and overflow and nothing else - so height:100% here has
         nothing to resolve against and quietly becomes auto. The tree is
         therefore allowed to be as tall as it is, and the page scrolls it,
         which leaves one scrollbar instead of two. */
      :host {
        display: block;
      }
      .flex-container {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
      /* At least as tall as the window, and the project tab takes whatever the
         card leaves. The tree grows into that, which puts the properties pane
         on the bottom edge where it is drawn to sit. Without it a short tree -
         one search hit - left the pane hanging under the tree with empty page
         below it, open at the bottom towards nothing. Like #loading, the
         height comes from the window, because no parent has one. */
      #content {
        min-height: 100vh;
      }
      #project {
        position: relative;
        flex-grow: 1;
      }
      /* Laid over the tab so the spinner sits in the middle of the window
         rather than at the top of an empty list. The height cannot come from
         a parent - see above - so it comes from the window, less the panel
         header and the tabs above it. */
      #loading {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        min-height: calc(100vh - 90px);
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background-color: var(--primary-background-color);
      }
      #ihcprojecttree {
        padding: 12px;
        flex-grow: 1;
      }
      /* Search and filter, in the strip between the card and the first room.
         Lined up with the cards below it, and stuck to the top so it stays
         reachable while scrolling a long tree. */
      #filterbar {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 12px;
        padding: 8px 0 0 0;
        position: sticky;
        top: 0;
        z-index: 2;
        background-color: var(--primary-background-color);
      }
      #filterbar > ha-icon {
        flex: 0 0 auto;
        color: var(--secondary-text-color);
      }
      /* Fields do not inherit the theme's font - see the note in the dialog */
      #filterbar input,
      #filterbar select {
        font: inherit;
        font-size: 14px;
        padding: 6px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 18px;
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color);
      }
      #filterbar input {
        flex: 1 1 auto;
        min-width: 0;
      }
      #filterbar select {
        flex: 0 0 auto;
        max-width: 16em;
      }
      #filterbar input:focus,
      #filterbar select:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      #filtercount {
        flex: 0 0 auto;
        font-size: 13px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      #clearfilter {
        flex: 0 0 auto;
        cursor: pointer;
        color: var(--secondary-text-color);
      }
      #clearfilter:hover {
        color: var(--primary-color);
      }
      #nohits {
        padding: 24px 4px;
        color: var(--secondary-text-color);
      }
      /* The controller itself, above the rooms. The title, the tabs and the
         buttons that used to sit in a band across the top are all in here. */
      #controllercard {
        background-color: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow,
          0px 2px 1px -1px rgba(0, 0, 0, .2),
          0px 1px 1px 0px rgba(0, 0, 0, .14),
          0px 1px 3px 0px rgba(0, 0, 0, .12));
        margin: 12px 12px 12px 12px;
        overflow: hidden;
      }
      #cardtop {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px;
      }
      #cardtop > ha-icon {
        flex: 0 0 auto;
        width: 40px;
        height: 40px;
        --mdc-icon-size: 40px;
        color: var(--primary-color);
      }
      #cardtext {
        flex: 1 1 auto;
        min-width: 0;
        /* The facts below count columns from how much room they actually have
           here, not from how wide the window is - the sidebar and the card's
           own padding take a good deal of it, so the two are far apart */
        container-type: inline-size;
      }
      /* Both reload buttons in one place, at the right hand end of the tab
         row. They used to sit in two different corners of the card - one
         floating over the heading and one under it - which read as two
         unrelated things rather than as what can be done here. */
      #headeractions {
        flex: 0 0 auto;
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #controllercard .title {
        font-size: 22px;
        font-weight: 500;
        line-height: 28px;
      }
      /* Everything the controller says about itself. Three columns wide, two
         when the window is narrower and one on a phone - the point is that the
         card stays low. It reads across: the first rows are what is worth a
         glance, the last is what is only looked up when something is wrong,
         and that one is dimmed. */
      #facts {
        display: grid;
        grid-template-columns: repeat(3, max-content minmax(0, 1fr));
        column-gap: 10px;
        row-gap: 2px;
        align-items: baseline;
        margin-top: 6px;
        font-size: 13px;
        line-height: 18px;
      }
      @container (max-width: 1080px) {
        #facts {
          grid-template-columns: repeat(2, max-content minmax(0, 1fr));
        }
      }
      @container (max-width: 660px) {
        #facts {
          grid-template-columns: max-content minmax(0, 1fr);
        }
      }
      .factlabel {
        color: var(--secondary-text-color);
      }
      /* The air between one pair and the next - a column gap wide enough to
         separate the pairs would also push each label away from its value.
         A value that does not fit wraps; it used to be cut off with an
         ellipsis, and then the reading was simply gone. */
      .factvalue {
        padding-right: 28px;
        overflow-wrap: break-word;
      }
      .factvalue.rare {
        color: var(--secondary-text-color);
      }
      /* Stuck to the bottom of the window, so the resource you picked stays
         readable however far down the tree you scrolled.
         Drawn as a panel rising from the bottom edge: the same width and the
         same background as the room cards, rounded at the top two corners
         only, and open at the bottom because that is where it comes from.
         It used to be the page's own background with a divider along the top,
         and a divider is faint enough that the pane read as more page rather
         than as a thing in its own right - so the edge is in the secondary
         text colour, which is a grey the theme picks. */
      #ihcproperties {
        flex-grow: 0;
        margin: 0 12px;
        padding: 10px 16px;
        border: 1px solid var(--secondary-text-color);
        border-bottom: none;
        border-radius: var(--ha-card-border-radius, 12px)
          var(--ha-card-border-radius, 12px) 0 0;
        box-sizing: border-box;
        position: sticky;
        bottom: 0;
        z-index: 1;
        background-color: var(--card-background-color, #fff);
      }
      /* Gone entirely when nothing is selected. Empty it still had a border
         and its padding, so a strip of it sat across the bottom of the window
         describing nothing. */
      #ihcproperties.hidden {
        display: none;
      }
      /* Log gets the same card as the rooms, so the two tabs look like one
         panel rather than a list of cards and a bare page */
      #log {
        background-color: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow,
          0px 2px 1px -1px rgba(0, 0, 0, .2),
          0px 1px 1px 0px rgba(0, 0, 0, .14),
          0px 1px 3px 0px rgba(0, 0, 0, .12));
        margin: 0 12px 12px 12px;
        padding-bottom: 10px;
        overflow: hidden;
      }
      /* The tabs, along the bottom edge of the card. Drawn as buttons, because
         that is what they are, and started where the folders in the cards
         below start - past the card's own padding, the chevron and the gap. */
      #controllertab {
        display: flex;
        align-items: center;
        gap: 8px;
        border-top: 1px solid var(--divider-color);
        padding: 8px 16px 8px calc(16px + 24px + 10px);
        cursor: default;
      }
      .tab-button {
        font-size: 14px;
        padding: 6px 16px;
        cursor: pointer;
        color: var(--primary-text-color);
        background-color: var(--secondary-background-color);
        border: 1px solid transparent;
        border-radius: 16px;
      }
      .tab-button:hover {
        border-color: var(--primary-color);
      }
      .tab-button.selected {
        color: var(--primary-color);
        border-color: var(--primary-color);
        font-weight: 500;
      }
      #loaderror {
        padding: 10px;
        color: var(--error-color, #db4437);
      }
      `
    ];
  }

  render() {
    return html`
        ${this.show ? "" : html`<style>#content { display:none}</style>`}
        ${this.selectedtab == 0 ? html`` : html`<style>#project { display:none}</style>`}
        ${this.selectedtab == 1 ? html`<style>#log { display:block}</style>` : html`<style>#log { display:none}</style>`}
        <div id="content" class="flex-container">
          ${this.render_controllercard()}
          <div id="project" class="flex-container">
            ${this.isProjectLoading ? html`
              <div id="loading">
                <ihc-loader></ihc-loader>
                <div>${localize("loading_controller")}</div>
              </div>` : ""}
            ${this.loadError ? html`
              <div id="loaderror">
                <div>${this.loadError}</div>
                <div>${localize("log_has_details")}</div>
              </div>` : ""}
            ${this.render_filterbar()}
            <div id="ihcprojecttree" @select=${this.onSelectNode}
              @nodeexpanded=${this.onCardExpanded} @nodecollapsed=${this.onNodeCollapsed}
              @pickicon=${this.onPickIcon}>
              ${this.render_groups()}
              ${this.filtering() && this.filterHits == 0 ? html`
                <div id="nohits">${localize("filter_no_hits")}</div>` : ""}
            </div>
            <ihc-icon-dlg id="icon-dlg" @ok=${this.onIconChosen}></ihc-icon-dlg>
            <ihc-properties id="ihcproperties" class="${this.selected ? "" : "hidden"}"
              controllerId="${this.controllerId}"
              @closeproperties=${this.clearSelection}
              @changed=${this.onChanged}></ihc-properties>
          </div>
          <div id="log">
            <ihc-log id="ihclog" controllerId="${this.controllerId}"></ihc-log>
          </div>
      </div>
    `;
  }

  // Everything about the controller in one card: what it is, which project it
  // runs, the tabs, and the buttons the panel hands down through the slot.
  render_controllercard() {
    const system = this.systemInfo;
    const project = this.projectInfo;
    return html`
      <div id="controllercard">
        <div id="cardtop">
          <ha-icon icon="mdi:chip"></ha-icon>
          <div id="cardtext">
            <div class="title">IHC Viewer</div>
            <div id="facts">
              ${this.fact(localize("info_project"), this.projectLine(project),
                false, this.projectRevision(project))}
              ${this.fact(localize("info_contents"), this.groupCount())}
              ${this.fact(localize("info_uptime"), system && this.uptimeAsString(system.uptime))}
              ${this.fact(localize("info_firmware"), system?.version)}
              ${this.fact(localize("info_serial_number"), system?.serial_number || this.controllerId)}
              ${this.fact(localize("info_brand"), system && `${system.brand} ${system.hw_revision}`)}
              ${this.fact(localize("info_led_dimmer_version"), system?.led_dimmer_software_version, true)}
              ${this.fact(localize("info_production_date"), system?.production_date, true)}
              ${this.fact(localize("info_software_date"), system?.sw_date, true)}
            </div>
          </div>
        </div>
        <div id="controllertab">
          <div class="tab-button ${this.selectedtab == 0 ? 'selected' : ''}" @click=${this.selectTab} data-tabid='0'>${localize("tab_project")}</div>
          <div class="tab-button ${this.selectedtab == 1 ? 'selected' : ''}" @click=${this.selectTab} data-tabid='1'>${localize("tab_log")}</div>
          <span id="headeractions">
            <slot name="header-actions"></slot>
          </span>
        </div>
      </div>`;
  }

  // One label and one value in the grid. Nothing at all when the value is
  // missing, so a controller that answers with less does not leave empty rows.
  fact(label: string, value, rare = false, title = null) {
    if (!value) return "";
    return html`<span class="factlabel">${label}</span><span
      class="factvalue ${rare ? "rare" : ""}" title="${title || value}">${value}</span>`;
  }

  // What the card shows about the project is when it was last changed - that
  // is the part a person can use. The revision is two numbers the controller
  // counts in its own way (nine digits on a real installation), and it exists
  // here to tell one project from another, not to be read. It is in the
  // tooltip so it can still be seen.
  projectLine(project) {
    if (!project?.lastmodified) return "";
    return localize("last_changed", this.readableTime(project.lastmodified));
  }

  projectRevision(project) {
    if (!project) return null;
    return `${project.projectMajorRevision}.${project.projectMinorRevision}`;
  }

  // 2025-10-14T00:22:00 is a machine's way of writing it
  readableTime(value: string): string {
    return `${value}`.replace("T", " ").replace(/:\d\d$/, "");
  }

  groupCount() {
    if (this.ihcproject == null) return "";
    let products = 0;
    for (let group of this.ihcproject.Groups) products += group.Products.length;
    return localize("rooms_products", this.ihcproject.Groups.length, products);
  }

  uptimeAsString(uptime) {
    var seconds = parseInt(uptime) / 1000;
    if (isNaN(seconds)) return "";
    var days = Math.floor(seconds / 60 / 60 / 24);
    var hours = Math.floor((seconds - days * 60 * 60 * 24) / 60 / 60);
    var hourstr = `${hours} ${localize("hours")}`;
    if (days > 0) return `${days} ${localize("days")} ${hourstr}`;
    return hourstr;
  }

  render_groups() {

    if (this.ihcproject == null || this.isProjectLoading) return "";
    return this.visibleGroups().map(item => html`
      <ihc-tree-node card id="group_${item.Id}"></ihc-tree-node>
    `);
  }

  // The rooms that have something to show. Without a filter that is all of
  // them; with one, only the rooms that still hold a match.
  visibleGroups() {
    if (!this.filtering()) return this.ihcproject.Groups;
    return this.ihcproject.Groups.filter(
      (group) => (group.filtered || []).length > 0);
  }

  filtering(): boolean {
    return this.filterText.trim() !== "" || this.filterProduct !== "";
  }

  // Search and filter, along the top of the tree. Sixty products and several
  // hundred resources is more than a person scrolls through to find one
  // button, and the thing you know about it is usually its ihc id or a word
  // from the name it has somewhere - in the project, or in Home Assistant.
  render_filterbar() {
    if (this.ihcproject == null || this.isProjectLoading) return "";
    return html`
      <div id="filterbar">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input id="search" type="search" .value=${this.filterText}
          placeholder="${localize("filter_search_placeholder")}"
          @input=${(e) => { this.filterText = e.target.value; this.applyFilter(); }}>
        <select id="producttype" .value=${this.filterProduct}
          @change=${(e) => { this.filterProduct = e.target.value; this.applyFilter(); }}>
          <option value="">${localize("filter_all_products")}</option>
          ${this.productNames().map((name) => html`
            <option value="${name}" ?selected=${name === this.filterProduct}>${name}</option>`)}
        </select>
        ${this.filtering() ? html`
          <span id="filtercount">${localize("filter_count", this.filterHits, this.resourceCount())}</span>
          <ha-icon id="clearfilter" icon="mdi:close" title="${localize("filter_clear")}"
            @click=${this.clearFilter}></ha-icon>` : ""}
      </div>`;
  }

  // The product types actually in this project, so the list is never longer
  // than what can be found
  productNames(): string[] {
    if (this.ihcproject == null) return [];
    const names = new Set<string>();
    for (let group of this.ihcproject.Groups) {
      for (let product of group.Products) names.add(product.Name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }

  resourceCount(): number {
    if (this.ihcproject == null) return 0;
    let count = 0;
    for (let group of this.ihcproject.Groups) {
      for (let child of group.Children) count += (child.Children || []).length;
    }
    return count;
  }

  clearFilter() {
    this.filterText = "";
    this.filterProduct = "";
    this.applyFilter();
  }

  // Which resources survive the filter is worked out once, here, and hung on
  // the nodes as `filtered`. The tree then draws that list instead of the
  // whole one - the objects keep their identity, so everything that reads
  // them by instanceof goes on working.
  applyFilter() {
    this.computeFilter();
    this.clearSelection();
    this.requestUpdate();
    // A filter that leaves three rooms closed has found nothing you can see,
    // so what survives is opened. The one-room-at-a-time rule is the opposite
    // of what is wanted here and is suspended while a filter is on.
    this.updateComplete.then(() => this.openFiltered(this.filtering()));
  }

  computeFilter() {
    if (this.ihcproject == null) return;
    this.filterHits = filterGroups(
      this.ihcproject.Groups, this.filterText, this.filterProduct);
  }

  // Open what the filter left, and make the tree draw it again.
  //
  // The redraw has to be asked for. computeFilter writes the new selection
  // into the same group and product objects the nodes already hold, and a
  // node's data is a Lit property compared by identity - the object did not
  // change, so nothing is scheduled. The tree therefore only redrew when the
  // filter changed which rooms were visible, because that made Lit build new
  // nodes. Picking another product in the SAME room changed nothing on screen:
  // the count in the filter bar moved, the rows did not.
  //
  // It showed up on a set of alarm products that all sit in one room: picking
  // one and then the other looked dead, while picking a product from another
  // room looked fine.
  openFiltered(active: boolean) {
    for (let node of this.groupNodes()) {
      node.requestUpdate();
      node.expanded = active;
      node.updateComplete.then(() => {
        for (let child of Array.from(
          node.shadowRoot.querySelectorAll("ihc-tree-node")) as IhcTreeNode[]) {
          child.requestUpdate();
          if (active) child.expanded = true;
        }
      });
    }
  }

  constructor() {
    super();
    this.isProjectLoading = false;
    this.loadError = null;
    this.ihcproject = null;
    this.ihcmapping = null;
    this.selectedtab = 0;
  }

  async connectedCallback() {
    super.connectedCallback();
    this.loadController();
  }

  async updated(changedProps) {
    super.updated(changedProps);

    if (this.ihcproject == null) return;
    this.ihcproject.Groups.map((item) => {
      var treenode = this.shadowRoot.getElementById(`group_${item.Id}`) as IhcTreeNode;
      if (treenode) {
        treenode.data = item;
        treenode.chosenIcons = this.groupIcons;
      }
    });
  }

  // One room open at a time - opening a room closes the one that was open
  onCardExpanded(event) {
    const opened = event?.detail?.node;
    for (let node of this.groupNodes()) {
      if (node !== opened) node.collapse();
    }
  }

  // Something closed, so whatever was selected may have gone with it. The
  // properties pane belongs to the row it describes, and a row nobody can see
  // has no business filling the bottom of the window.
  onNodeCollapsed() {
    this.clearSelection();
  }

  clearSelection() {
    if (this.selected) {
      this.selected.selected = Selection.NotSelected;
      this.selected = null;
    }
    if (this.onselected) {
      this.onselected.selected = Selection.NotSelected;
      this.onselected = null;
    }
    if (this.offselected) {
      this.offselected.selected = Selection.NotSelected;
      this.offselected = null;
    }
    var properties = this.shadowRoot.getElementById("ihcproperties") as IhcPropertiesElement;
    if (properties) properties.setSelected(null);
  }

  onPickIcon(event) {
    const node = event?.detail?.node;
    if (!node) return;
    const dialog = this.shadowRoot.getElementById("icon-dlg") as IhcIconDialog;
    dialog.open(node.data.Id, node.data.Name, this.groupIcons?.[node.data.Id]);
  }

  async onIconChosen() {
    const dialog = this.shadowRoot.getElementById("icon-dlg") as IhcIconDialog;
    const controller = IHCManager.instance.get(this.controllerId);
    if (!await controller.setGroupIcon(dialog.groupId, dialog.icon)) {
      this.loadError = localize("icon_save_failed");
      return;
    }
    this.groupIcons = await controller.getGroupIcons();
    for (let node of this.groupNodes()) {
      node.chosenIcons = this.groupIcons;
      node.requestUpdate();
    }
  }

  groupNodes(): IhcTreeNode[] {
    if (this.ihcproject == null) return [];
    return this.ihcproject.Groups
      .map((group) => this.shadowRoot.getElementById(`group_${group.Id}`) as IhcTreeNode)
      .filter((node) => node != null);
  }

  async loadController() {
    this.isProjectLoading = true;
    this.loadError = null;
    // Everything below has to be able to fail without leaving the tab loading
    // forever. It used to run without a net: a failing request left the mapping
    // null, updateProject then threw on `in null`, and because loadController is
    // called without being awaited the spinner just kept turning with nothing on
    // screen to say what had happened.
    try {
      const controller = IHCManager.instance.get(this.controllerId);
      this.ihcmapping = await controller.getMapping();
      // If any entities are new we have to reload the ihc integration
      for (let id in this.ihcmapping) {
        let entity = this.ihcmapping[id];
        if ('changed' in entity) {
          this.dispatchEvent(new CustomEvent("reloadneeded", { bubbles: true, composed: true }));
          break;
        }
      }
      this.groupIcons = await controller.getGroupIcons();
      this.ihcproject = await controller.getProject();
      this.projectInfo = controller.projectInfo;
      this.systemInfo = await controller.getSystemInfo();
      if (this.ihcproject) {
        this.updateProject(this.ihcproject);
      }
    } catch (err) {
      this.loadError = `${err}`;
    } finally {
      this.isProjectLoading = false;
    }
  }

  // A resource was added or removed, and the api has reloaded the ihc
  // integration to put it into effect. The mapping is stale, so everything is
  // read again - and the properties pane waits for it, so its ring stays up
  // until the tree and the badges are right.
  onChanged(event) {
    event.detail?.wait?.push(this.refreshAfterReload());
    // False, not missing: the change was saved, but the reload did not go
    // through. An error that stopped the change itself says reloaded nothing.
    if (event.detail?.reloaded === false) {
      this.dispatchEvent(new CustomEvent("reloadneeded", { bubbles: true, composed: true }));
    }
  }

  // Called after the ihc integration has been reloaded. The entities have been
  // created from scratch, so the mapping must be fetched again and the tree
  // redrawn to get the connected markers right. The project is kept, so
  // nothing is downloaded from the controller and the tree stays open where
  // the user left it.
  async refreshAfterReload() {
    IHCManager.instance.get(this.controllerId).clearMapping();
    this.ihcmapping = await IHCManager.instance.get(this.controllerId).getMapping();
    if (this.ihcproject == null) return;
    this.updateProject(this.ihcproject);
    for (let group of this.ihcproject.Groups) {
      var treenode = this.shadowRoot.getElementById(`group_${group.Id}`) as IhcTreeNode;
      if (treenode) treenode.refresh();
    }
    if (this.selected) {
      var properties: IhcPropertiesElement = this.shadowRoot.getElementById("ihcproperties") as IhcPropertiesElement;
      await properties.setSelected(this.selected);
    }
  }

  // Gather the children of each node, and mark the resources that already are
  // an entity in Home Assistant
  updateProject(project) {
    for (let group of project.Groups) {
      group.Children = [];
      for (let product of group.Products) {
        group.Children.push(product);
        product.Children = [];
        for (let input of product.Inputs) {
          product.Children.push(input);
          this.markResource(input, product, group);
          input.Product = product;
        }
        for (let output of product.Outputs) {
          product.Children.push(output);
          this.markResource(output, product, group);
          output.Product = product;
        }
      }
      for (let fn of group.FunctionBlocks) {
        group.Children.push(fn);
        fn.Children = [];
        for (let input of fn.Inputs) {
          fn.Children.push(input);
          this.markResource(input, fn, group);
        }
        for (let output of fn.Outputs) {
          fn.Children.push(output);
          this.markResource(output, fn, group);
        }
      }
    }
    this.ihcproject = project;
    // The children were just rebuilt, so what a filter had picked out points
    // at the old ones. Worked out again, without the side effects of typing
    // in the field: nothing is closed and nothing is deselected here.
    this.computeFilter();
  }

  // Whether this resource is an entity in Home Assistant, and what kind. The
  // colour of the arrow said only that it was something - which of the four
  // platforms it had become could not be read anywhere in the tree.
  //
  // The entity id and the name Home Assistant shows are kept here too: they
  // are what the search looks through, and the resource is where the search
  // has them to hand. Parent and group come along because a resource on its
  // own cannot say which switch or which room it belongs to, and the name
  // suggested when it is added is built from exactly those two.
  markResource(resource, parent?, group?) {
    resource.Parent = parent;
    resource.Group = group;
    const mapping = this.ihcmapping[resource.Id];
    resource.connected = mapping !== undefined;
    resource.entity_id = mapping?.entity_id || "";
    resource.platform = platformOf(resource.entity_id);
    resource.friendlyName = this.friendlyName(resource.entity_id);
  }

  // What Home Assistant calls the entity. It is not in the mapping - that has
  // only the entity id - so it is read from the states the panel was handed.
  friendlyName(entity_id: string): string {
    if (!entity_id) return "";
    const state = IHCManager.instance.hass?.states?.[entity_id];
    return state?.attributes?.friendly_name || "";
  }

  async onSelectNode(event) {
    var properties: IhcPropertiesElement = this.shadowRoot.getElementById("ihcproperties") as IhcPropertiesElement;
    var node = event?.detail?.node;
    // When shift is down we have multiselect
    if (this.selected && event.detail.shiftKey) {
      if (this.selected == node) return false;
      if (this.offselected) return false;
      if (this.onselected) {
        if (this.onselected == node) return false;
        this.offselected = node;
        node.selected = Selection.OffIdSelected;
      }
      else {
        this.onselected = node;
        node.selected = Selection.OnIdSelected;
      }
      properties.setSelected(this.selected, this.onselected?.data.Id, this.offselected?.data.Id);
      return false;
    }
    this.clearSelection();
    if (node == null) return false;
    this.selected = node;
    this.selected.selected = Selection.Selected;
    if (node.data instanceof IHCResource) {
      properties.setSelected(this.selected);
    }
    return false;
  }

  selectTab(event) {
    var tab = event.target.attributes['data-tabid'].value;
    this.selectedtab = tab;
  }

}
