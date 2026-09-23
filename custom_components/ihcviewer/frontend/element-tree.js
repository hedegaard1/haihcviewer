export const __webpack_esm_id__=526;export const __webpack_esm_ids__=[526];export const __webpack_esm_modules__={360(e,t,o){o.r(t),o.d(t,{IhcTreeNode:()=>c,Selection:()=>a,platformLabel:()=>l});var a,n=o(174),r=o(791),i=o(781),s=o(958),d=o(202),h=function(e,t,o,a){var n,r=arguments.length,i=r<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,a);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(i=(r<3?n(i):r>3?n(t,o,i):n(t,o))||i);return r>3&&i&&Object.defineProperty(t,o,i),i};function l(e){switch(e){case"binary_sensor":return(0,d.k)("add_binary_sensor_button");case"light":return(0,d.k)("add_light_button");case"sensor":return(0,d.k)("add_sensor_button");case"switch":return(0,d.k)("add_switch_button")}return""}!function(e){e[e.NotSelected=0]="NotSelected",e[e.Selected=1]="Selected",e[e.OnIdSelected=2]="OnIdSelected",e[e.OffIdSelected=3]="OffIdSelected"}(a||(a={}));let c=class extends n.WF{static get styles(){return n.AH`
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
    `}render(){const e=n.qy`
      <div class="row ${this.selected>=a.Selected?"selected":""} ${this.hasChildren()?"":"leaf"} ${this.expanded&&this.hasChildren()?"expanded":""}"
        @click=${this.onRowClick}>
        ${this.render_expand()}
        <ha-icon class="icon ${this.data.connected?"connected":""}"
          .icon=${this.icon()}
          title="${this.card?(0,d.k)("pick_icon_title"):""}"
          @click=${this.card?this.onPickIcon:null}></ha-icon>
        <span class="text">
          <span class="name ${this.nameClasses()}">${this.data.Name}</span>
          ${this.data.Position?n.qy`<span class="detail">${this.data.Position}</span>`:""}
          ${this.data.Note?n.qy`<span class="detail">${this.data.Note}</span>`:""}
        </span>
        ${this.renderBadges()}
      </div>`;return this.card?n.qy`
      <div class="card ${this.expanded?"open":""}">
        ${e}
        ${this.render_children()}
      </div>`:n.qy`${e}${this.render_children()}`}renderBadges(){if(this.hasChildren())return"";const e=l(this.data.platform);return n.qy`
      <span class="badges">
        <span class="badge id" title="${(0,d.k)("badge_id_title")}">${this.data.Id}</span>
        ${e?n.qy`<span class="badge platform">${e}</span>`:""}
      </span>`}icon(){return this.data instanceof i.Qp?(0,s.$t)(this.data,this.chosenIcons):this.data instanceof i.Ce?(0,s.Z2)(this.data):this.data instanceof i._X?s.yL:this.data instanceof i.pJ?s.xG:this.data instanceof i.iU?s.K4:"mdi:circle-small"}render_expand(){return this.data.Children&&0!=this.data.Children.length?n.qy`<ha-icon class="expand"
      .icon=${this.expanded?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>`:n.qy`<span class="expand placeholder"></span>`}shownChildren(){return this.data.filtered||this.data.Children||[]}render_children(){return this.expanded?n.qy`<ul @nodeexpanded=${this.onChildExpanded}>${this.shownChildren().map(e=>n.qy`<li><ihc-tree-node id="treenode_${e.Id}"></ihc-tree-node></li>`)}</ul>`:""}constructor(){super(),this.data=null,this.expanded=!1,this.selected=a.NotSelected,this.card=!1,this.chosenIcons=null,this.expanded=!1,this.selected=a.NotSelected}updated(e){const t=Object.create(null,{updated:{get:()=>super.updated}});return o=this,a=void 0,r=function*(){t.updated.call(this,e),this.shownChildren().map(e=>{var t=this.shadowRoot.getElementById(`treenode_${e.Id}`);t&&(t.data=e)})},new((n=void 0)||(n=Promise))(function(e,t){function i(e){try{d(r.next(e))}catch(e){t(e)}}function s(e){try{d(r.throw(e))}catch(e){t(e)}}function d(t){var o;t.done?e(t.value):(o=t.value,o instanceof n?o:new n(function(e){e(o)})).then(i,s)}d((r=r.apply(o,a||[])).next())});var o,a,n,r}refresh(){if(this.requestUpdate(),this.expanded)for(let t of this.shownChildren()){var e=this.shadowRoot.getElementById(`treenode_${t.Id}`);e&&e.refresh()}}hasChildren(){return this.data.Children&&this.data.Children.length>0}onRowClick(e){this.hasChildren()?this.toggleExpand(e):this.select(e)}toggleExpand(e){e&&e.stopPropagation(),this.data.Children&&0!=this.data.Children.length&&(this.expanded?this.collapse():(this.expanded=!0,this.dispatchEvent(new CustomEvent("nodeexpanded",{bubbles:!0,composed:!0,detail:{node:this}}))))}collapse(){this.expanded&&(this.expanded=!1,this.dispatchEvent(new CustomEvent("nodecollapsed",{bubbles:!0,composed:!0})))}onChildExpanded(e){var t;e.stopPropagation();const o=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.node,a=this.shadowRoot.querySelectorAll("ihc-tree-node");for(let e of Array.from(a))e!==o&&e.collapse()}onPickIcon(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("pickicon",{bubbles:!0,composed:!0,detail:{node:this}}))}nameClasses(){let e="";return this.selected==a.OnIdSelected&&(e+=" onselected"),this.selected==a.OffIdSelected&&(e+=" offselected"),e}select(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("select",{bubbles:!0,composed:!0,detail:{node:this,shiftKey:e.shiftKey}}))}};h([(0,r.MZ)({type:Object})],c.prototype,"data",void 0),h([(0,r.MZ)({type:Boolean})],c.prototype,"expanded",void 0),h([(0,r.MZ)({type:Number})],c.prototype,"selected",void 0),h([(0,r.MZ)({type:Boolean})],c.prototype,"card",void 0),h([(0,r.MZ)({type:Object})],c.prototype,"chosenIcons",void 0),c=h([(0,r.EM)("ihc-tree-node")],c)}};
//# sourceMappingURL=element-tree.js.map