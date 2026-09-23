import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  IHCFunctionBlock,
  IHCGroup,
  IHCInput,
  IHCOutput,
  IHCProduct,
} from "../ihcproject";
import {
  FUNCTIONBLOCK_ICON,
  INPUT_ICON,
  OUTPUT_ICON,
  groupIcon,
  productIcon,
} from "../icons";
import { localize } from "../localize";

export enum Selection {
  NotSelected,
  Selected,
  OnIdSelected,
  OffIdSelected,
};

// Said the same way as the buttons that add it, so the badge and the button
// are recognisably the same thing.
export function platformLabel(platform: string): string {
  switch (platform) {
    case "binary_sensor": return localize("add_binary_sensor_button");
    case "light": return localize("add_light_button");
    case "sensor": return localize("add_sensor_button");
    case "switch": return localize("add_switch_button");
  }
  return "";
}

@customElement("ihc-tree-node")
export class IhcTreeNode extends LitElement {

  @property({ type: Object })
  public data = null;

  @property({ type: Boolean })
  public expanded = false;

  @property({ type: Number })
  public selected: Selection = Selection.NotSelected;

  // A group is drawn as a card of its own. Everything below it is a row.
  @property({ type: Boolean })
  public card = false;

  // The icons someone has picked for the rooms, keyed by the room's ihc id.
  // Only a card reads it - nothing else in the tree can be given an icon.
  @property({ type: Object })
  public chosenIcons = null;

  static get styles() {
    return css`
      /* A room, drawn like the cards Home Assistant uses elsewhere */
      .card {
        background-color: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow,
          0px 2px 1px -1px rgba(0, 0, 0, .2),
          0px 1px 1px 0px rgba(0, 0, 0, .14),
          0px 1px 3px 0px rgba(0, 0, 0, .12));
        margin-bottom: 9px;
        overflow: hidden;
        border: 1px solid transparent;
        box-sizing: border-box;
      }
      /* The room that is open is marked on its edge and in its own heading.
         Filling the whole card was heavy, and it read as if the room itself
         had been selected - which is not something that can happen: a room
         has nothing the properties pane can show. The border is there when
         closed too, only transparent, so nothing moves when it opens. */
      .card.open {
        border-color: var(--primary-color);
      }
      .card.open > .row .name,
      .card.open > .row .icon,
      .card.open > .row .expand {
        color: var(--primary-color);
      }
      /* Low rather than narrow: the padding above and below has come down and
         the heading is a couple of sizes smaller. The width is as it was. */
      .card > .row {
        padding: 4px 16px;
        cursor: pointer;
      }
      .card > .row .name {
        font-size: 16px;
        font-weight: 500;
      }
      /* The room's own icon is the way in to choosing another one */
      .card > .row .icon {
        cursor: pointer;
      }
      .card > .row .icon:hover {
        color: var(--primary-color);
      }
      .card > ul {
        padding: 0 16px 6px 16px;
      }
      /* A line between the things in a room. Grey rather than the primary
         colour: that colour means "open" or "selected" here, and using it for
         plain structure as well would leave it meaning nothing. Only between
         the room's own children - drawing one at every depth as well turns
         the tree into a grid. */
      .card > ul > li + li {
        border-top: 1px solid var(--divider-color);
      }

      /* The whole row is the target. What a click does depends on what the
         row is: anything with children opens and closes, and a resource - the
         only thing the properties pane can show - is selected. Before this,
         only the name itself reacted, and only by selecting, so clicking a
         room sometimes highlighted it and sometimes just opened it. */
      .row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 3px 0;
        user-select: none;
        cursor: pointer;
      }
      /* Same language as the open card: the colour is in the text and the
         icon, not behind them. A filled bar across the row was heavy, and it
         depended on --text-primary-color for readability - a variable that is
         meant to be "text on the primary colour" but that themes do not treat
         that way. Graphite points it at the ordinary body text colour, so the
         selected row came out dark on orange. */
      .row.selected {
        color: var(--primary-color);
      }
      /* The mouse says what a click will do. Every row here is clickable, and
         until it had been pressed nothing said so - on a list of twenty rooms
         the pointer was the only thing telling you where you were, and it
         does not know which row it is over. The colour is the one that
         already means "this one" in the tree, so hovering shows what
         pressing would settle on. */
      .row:hover .name,
      .row:hover .icon,
      .row:hover .expand {
        color: var(--primary-color);
      }
      /* And a row with something open under it keeps the colour, so the way
         down to what you are looking at is marked the whole way rather than
         only by the direction of a chevron. */
      .row.expanded .name,
      .row.expanded .icon,
      .row.expanded .expand {
        color: var(--primary-color);
      }
      .row.selected .name {
        font-weight: 600;
      }
      /* A resource is the one thing in the tree that can be picked, so it is
         drawn as something to press rather than as another line of text. The
         arrow stays - it is what says input or output. Marked the same way as
         everything else: colour on the edge and in the text, not a fill. */
      .row.leaf {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 2px 14px 2px 10px;
        margin: 2px 0;
        border: 1px solid var(--divider-color);
        border-radius: 16px;
      }
      .row.leaf:hover {
        border-color: var(--primary-color);
      }
      .row.leaf.selected {
        border-color: var(--primary-color);
      }
      /* The hidden chevron keeps the rows below a product lined up, but inside
         a chip it is just 24px of nothing */
      .row.leaf .expand.placeholder {
        display: none;
      }
      .expand {
        flex: 0 0 auto;
        width: 24px;
        height: 24px;
        color: var(--secondary-text-color);
      }
      .expand.placeholder {
        visibility: hidden;
      }
      .icon {
        flex: 0 0 auto;
        width: 24px;
        height: 24px;
        color: var(--secondary-text-color);
      }
      .row.selected .icon,
      .row.selected .expand {
        color: var(--primary-color);
      }
      /* A resource that is already an entity in Home Assistant */
      .icon.connected {
        color: var(--primary-color);
      }
      /* The ihc id, and what the resource became. The id is quiet - it is
         there to be read off and copied, not to catch the eye - while the
         platform carries the theme colour, because whether a resource is set
         up is the thing you scan the tree for. */
      .badges {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 0 0 auto;
        margin-left: 4px;
      }
      .badge {
        font-size: 11px;
        line-height: 18px;
        padding: 0 8px;
        border-radius: 9px;
        white-space: nowrap;
      }
      .badge.id {
        font-family: ui-monospace, "Roboto Mono", monospace;
        color: var(--secondary-text-color);
        background-color: var(--secondary-background-color);
      }
      .badge.platform {
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .name {
        font-size: 15px;
        line-height: 24px;
      }
      .name.onselected::after {
        content: "on_id";
        font-size: 12px;
        font-weight: bold;
        vertical-align: super;
        padding: 0px 5px 0px 5px;
      }
      .name.offselected::after {
        content: "off_id";
        font-size: 12px;
        font-weight: bold;
        vertical-align: super;
        padding: 0px 5px 0px 5px;
      }
      .detail {
        font-size: 12px;
        line-height: 16px;
        color: var(--secondary-text-color);
      }
      /* A shade under the name, so the two lines are still told apart */
      .row.selected .detail {
        color: var(--primary-color);
        opacity: .75;
      }
      /* Indented to where the parent's name begins, not to where its chevron
         does - past the chevron, the gap, the icon and the gap again. Then
         what sits under a product lines up with the product's own text. */
      ul {
        list-style: none;
        margin: 0;
        padding-left: calc(24px + 10px + 24px + 10px);
      }
    `;
  }

  render() {
    const row = html`
      <div class="row ${this.selected >= Selection.Selected ? "selected" : ""} ${this.hasChildren() ? "" : "leaf"} ${this.expanded && this.hasChildren() ? "expanded" : ""}"
        @click=${this.onRowClick}>
        ${this.render_expand()}
        <ha-icon class="icon ${this.data.connected ? "connected" : ""}"
          .icon=${this.icon()}
          title="${this.card ? localize("pick_icon_title") : ""}"
          @click=${this.card ? this.onPickIcon : null}></ha-icon>
        <span class="text">
          <span class="name ${this.nameClasses()}">${this.data.Name}</span>
          ${this.data.Position ? html`<span class="detail">${this.data.Position}</span>` : ""}
          ${this.data.Note ? html`<span class="detail">${this.data.Note}</span>` : ""}
        </span>
        ${this.renderBadges()}
      </div>`;
    if (!this.card) {
      return html`${row}${this.render_children()}`;
    }
    return html`
      <div class="card ${this.expanded ? "open" : ""}">
        ${row}
        ${this.render_children()}
      </div>`;
  }

  // The ihc id, and what the resource has become in Home Assistant. Only on a
  // resource: the id of a room or a product is not what anything points at,
  // and a badge on every row would be noise on the rows that cannot use it.
  //
  // Before this, the only sign that a resource was set up was the arrow going
  // from grey to the theme colour - which says that it is something, but not
  // what, and asks you to compare two rows to read it at all.
  renderBadges() {
    if (this.hasChildren()) return "";
    const platform = platformLabel(this.data.platform);
    return html`
      <span class="badges">
        <span class="badge id" title="${localize("badge_id_title")}">${this.data.Id}</span>
        ${platform ? html`<span class="badge platform">${platform}</span>` : ""}
      </span>`;
  }

  // Which icon belongs to this kind of thing. The project says what a product
  // is, so a light outlet looks like one wherever it sits in the tree.
  icon(): string {
    if (this.data instanceof IHCGroup)
      return groupIcon(this.data, this.chosenIcons);
    if (this.data instanceof IHCProduct) return productIcon(this.data);
    if (this.data instanceof IHCFunctionBlock) return FUNCTIONBLOCK_ICON;
    if (this.data instanceof IHCInput) return INPUT_ICON;
    if (this.data instanceof IHCOutput) return OUTPUT_ICON;
    return "mdi:circle-small";
  }

  render_expand() {
    if (!this.data.Children || this.data.Children.length == 0) {
      return html`<span class="expand placeholder"></span>`;
    }
    return html`<ha-icon class="expand"
      .icon=${this.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>`;
  }

  // What is drawn under this node. With a search or a product filter on, the
  // controller has put the surviving children in `filtered` - the real list
  // is left alone, so clearing the filter costs nothing and the objects keep
  // their identity.
  shownChildren() {
    return this.data.filtered || this.data.Children || [];
  }

  render_children() {
    if (!this.expanded) return "";
    return html`<ul @nodeexpanded=${this.onChildExpanded}>${this.shownChildren().map(
      (child) => html`<li><ihc-tree-node id="treenode_${child.Id}"></ihc-tree-node></li>`
    )}</ul>`;
  }

  constructor() {
    super();
    this.expanded = false;
    this.selected = Selection.NotSelected;
  }

  async updated(changedProps) {
    super.updated(changedProps);

    this.shownChildren().map((child) => {
      var treenode = this.shadowRoot.getElementById(`treenode_${child.Id}`) as IhcTreeNode;
      if (treenode) {
        treenode.data = child;
      }
    });
  }

  // Draw this node and the children that are currently shown again. The data
  // objects keep their identity when the mapping changes, so lit has no way of
  // seeing that a connected marker was updated.
  refresh() {
    this.requestUpdate();
    if (!this.expanded) return;
    for (let child of this.shownChildren()) {
      var treenode = this.shadowRoot.getElementById(`treenode_${child.Id}`) as IhcTreeNode;
      if (treenode) treenode.refresh();
    }
  }

  // Anything with something under it opens and closes. A resource has nothing
  // under it and is the only thing the properties pane can show, so that is
  // what a click selects.
  hasChildren(): boolean {
    return this.data.Children && this.data.Children.length > 0;
  }

  onRowClick(event) {
    if (this.hasChildren()) {
      this.toggleExpand(event);
      return;
    }
    this.select(event);
  }

  toggleExpand(event) {
    if (event) event.stopPropagation();
    if (!this.data.Children || this.data.Children.length == 0) return;
    if (this.expanded) {
      this.collapse();
      return;
    }
    this.expanded = true;
    // One open at a time, at every level. A node cannot close its own siblings
    // - it does not know them - so it says that it opened, and whoever holds
    // the list closes the rest: the parent node for anything in the tree, and
    // the controller for the room cards at the top.
    this.dispatchEvent(new CustomEvent("nodeexpanded", {
      bubbles: true, composed: true, detail: { node: this },
    }));
  }

  // Closing is always done through here, whoever asks, because something
  // closing can take the selected resource off the screen with it - and then
  // the properties pane at the bottom is describing something nobody can see.
  // The controller listens and clears the selection.
  collapse() {
    if (!this.expanded) return;
    this.expanded = false;
    this.dispatchEvent(new CustomEvent("nodecollapsed", {
      bubbles: true, composed: true,
    }));
  }

  // One of our own children opened. Close the others and stop here, so the
  // level above keeps what it has open.
  onChildExpanded(event) {
    event.stopPropagation();
    const opened = event?.detail?.node;
    const children = this.shadowRoot.querySelectorAll("ihc-tree-node");
    for (let child of Array.from(children) as IhcTreeNode[]) {
      if (child !== opened) child.collapse();
    }
  }

  onPickIcon(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("pickicon", {
      bubbles: true, composed: true, detail: { node: this },
    }));
  }

  nameClasses() {
    let cls = "";
    if (this.selected == Selection.OnIdSelected) cls += " onselected";
    if (this.selected == Selection.OffIdSelected) cls += " offselected";
    return cls;
  }

  select(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("select", {
        bubbles: true,
        composed: true,
        detail: {
          node: this,
          shiftKey: event.shiftKey
        },
      })
    );
  }
}
