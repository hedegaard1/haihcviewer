export const __webpack_esm_id__=394;export const __webpack_esm_ids__=[394];export const __webpack_esm_modules__={518(e,t,o){o.r(t),o.d(t,{IhcControllerElement:()=>u});var i=o(791),r=o(679),a=o(781),n=o(360),s=o(503),l=o(450),d=o(202),c=o(174),h=function(e,t,o,i){var r,a=arguments.length,n=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(n=(a<3?r(n):a>3?r(t,o,n):r(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n},p=function(e,t,o,i){return new(o||(o=Promise))(function(r,a){function n(e){try{l(i.next(e))}catch(e){a(e)}}function s(e){try{l(i.throw(e))}catch(e){a(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof o?t:new o(function(e){e(t)})).then(n,s)}l((i=i.apply(e,t||[])).next())})};o(320),o(480),o(999),o(360),o(560);let u=class extends c.WF{static get styles(){return[r.RF,c.AH`
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
      `]}render(){return c.qy`
        ${this.show?"":c.qy`<style>#content { display:none}</style>`}
        ${0==this.selectedtab?c.qy``:c.qy`<style>#project { display:none}</style>`}
        ${1==this.selectedtab?c.qy`<style>#log { display:block}</style>`:c.qy`<style>#log { display:none}</style>`}
        <div id="content" class="flex-container">
          ${this.render_controllercard()}
          <div id="project" class="flex-container">
            ${this.isProjectLoading?c.qy`
              <div id="loading">
                <ihc-loader></ihc-loader>
                <div>${(0,d.k)("loading_controller")}</div>
              </div>`:""}
            ${this.loadError?c.qy`
              <div id="loaderror">
                <div>${this.loadError}</div>
                <div>${(0,d.k)("log_has_details")}</div>
              </div>`:""}
            ${this.render_filterbar()}
            <div id="ihcprojecttree" @select=${this.onSelectNode}
              @nodeexpanded=${this.onCardExpanded} @nodecollapsed=${this.onNodeCollapsed}
              @pickicon=${this.onPickIcon}>
              ${this.render_groups()}
              ${this.filtering()&&0==this.filterHits?c.qy`
                <div id="nohits">${(0,d.k)("filter_no_hits")}</div>`:""}
            </div>
            <ihc-icon-dlg id="icon-dlg" @ok=${this.onIconChosen}></ihc-icon-dlg>
            <ihc-properties id="ihcproperties" class="${this.selected?"":"hidden"}"
              controllerId="${this.controllerId}"
              @closeproperties=${this.clearSelection}
              @changed=${this.onChanged}></ihc-properties>
          </div>
          <div id="log">
            <ihc-log id="ihclog" controllerId="${this.controllerId}"></ihc-log>
          </div>
      </div>
    `}render_controllercard(){const e=this.systemInfo,t=this.projectInfo;return c.qy`
      <div id="controllercard">
        <div id="cardtop">
          <ha-icon icon="mdi:chip"></ha-icon>
          <div id="cardtext">
            <div class="title">IHC Viewer</div>
            <div id="facts">
              ${this.fact((0,d.k)("info_project"),this.projectLine(t),!1,this.projectRevision(t))}
              ${this.fact((0,d.k)("info_contents"),this.groupCount())}
              ${this.fact((0,d.k)("info_uptime"),e&&this.uptimeAsString(e.uptime))}
              ${this.fact((0,d.k)("info_firmware"),null==e?void 0:e.version)}
              ${this.fact((0,d.k)("info_serial_number"),(null==e?void 0:e.serial_number)||this.controllerId)}
              ${this.fact((0,d.k)("info_brand"),e&&`${e.brand} ${e.hw_revision}`)}
              ${this.fact((0,d.k)("info_led_dimmer_version"),null==e?void 0:e.led_dimmer_software_version,!0)}
              ${this.fact((0,d.k)("info_production_date"),null==e?void 0:e.production_date,!0)}
              ${this.fact((0,d.k)("info_software_date"),null==e?void 0:e.sw_date,!0)}
            </div>
          </div>
        </div>
        <div id="controllertab">
          <div class="tab-button ${0==this.selectedtab?"selected":""}" @click=${this.selectTab} data-tabid='0'>${(0,d.k)("tab_project")}</div>
          <div class="tab-button ${1==this.selectedtab?"selected":""}" @click=${this.selectTab} data-tabid='1'>${(0,d.k)("tab_log")}</div>
          <span id="headeractions">
            <slot name="header-actions"></slot>
          </span>
        </div>
      </div>`}fact(e,t,o=!1,i=null){return t?c.qy`<span class="factlabel">${e}</span><span
      class="factvalue ${o?"rare":""}" title="${i||t}">${t}</span>`:""}projectLine(e){return(null==e?void 0:e.lastmodified)?(0,d.k)("last_changed",this.readableTime(e.lastmodified)):""}projectRevision(e){return e?`${e.projectMajorRevision}.${e.projectMinorRevision}`:null}readableTime(e){return`${e}`.replace("T"," ").replace(/:\d\d$/,"")}groupCount(){if(null==this.ihcproject)return"";let e=0;for(let t of this.ihcproject.Groups)e+=t.Products.length;return(0,d.k)("rooms_products",this.ihcproject.Groups.length,e)}uptimeAsString(e){var t=parseInt(e)/1e3;if(isNaN(t))return"";var o=Math.floor(t/60/60/24),i=`${Math.floor((t-60*o*60*24)/60/60)} ${(0,d.k)("hours")}`;return o>0?`${o} ${(0,d.k)("days")} ${i}`:i}render_groups(){return null==this.ihcproject||this.isProjectLoading?"":this.visibleGroups().map(e=>c.qy`
      <ihc-tree-node card id="group_${e.Id}"></ihc-tree-node>
    `)}visibleGroups(){return this.filtering()?this.ihcproject.Groups.filter(e=>(e.filtered||[]).length>0):this.ihcproject.Groups}filtering(){return""!==this.filterText.trim()||""!==this.filterProduct}render_filterbar(){return null==this.ihcproject||this.isProjectLoading?"":c.qy`
      <div id="filterbar">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input id="search" type="search" .value=${this.filterText}
          placeholder="${(0,d.k)("filter_search_placeholder")}"
          @input=${e=>{this.filterText=e.target.value,this.applyFilter()}}>
        <select id="producttype" .value=${this.filterProduct}
          @change=${e=>{this.filterProduct=e.target.value,this.applyFilter()}}>
          <option value="">${(0,d.k)("filter_all_products")}</option>
          ${this.productNames().map(e=>c.qy`
            <option value="${e}" ?selected=${e===this.filterProduct}>${e}</option>`)}
        </select>
        ${this.filtering()?c.qy`
          <span id="filtercount">${(0,d.k)("filter_count",this.filterHits,this.resourceCount())}</span>
          <ha-icon id="clearfilter" icon="mdi:close" title="${(0,d.k)("filter_clear")}"
            @click=${this.clearFilter}></ha-icon>`:""}
      </div>`}productNames(){if(null==this.ihcproject)return[];const e=new Set;for(let t of this.ihcproject.Groups)for(let o of t.Products)e.add(o.Name);return Array.from(e).sort((e,t)=>e.localeCompare(t))}resourceCount(){if(null==this.ihcproject)return 0;let e=0;for(let t of this.ihcproject.Groups)for(let o of t.Children)e+=(o.Children||[]).length;return e}clearFilter(){this.filterText="",this.filterProduct="",this.applyFilter()}applyFilter(){this.computeFilter(),this.clearSelection(),this.requestUpdate(),this.updateComplete.then(()=>this.openFiltered(this.filtering()))}computeFilter(){null!=this.ihcproject&&(this.filterHits=(0,l.lx)(this.ihcproject.Groups,this.filterText,this.filterProduct))}openFiltered(e){for(let t of this.groupNodes())t.requestUpdate(),t.expanded=e,t.updateComplete.then(()=>{for(let o of Array.from(t.shadowRoot.querySelectorAll("ihc-tree-node")))o.requestUpdate(),e&&(o.expanded=!0)})}constructor(){super(),this.isProjectLoading=!1,this.loadError=null,this.systemInfo=null,this.projectInfo=null,this.groupIcons=null,this.selected=null,this.onselected=null,this.offselected=null,this.filterText="",this.filterProduct="",this.filterHits=0,this.isProjectLoading=!1,this.loadError=null,this.ihcproject=null,this.ihcmapping=null,this.selectedtab=0}connectedCallback(){const e=Object.create(null,{connectedCallback:{get:()=>super.connectedCallback}});return p(this,void 0,void 0,function*(){e.connectedCallback.call(this),this.loadController()})}updated(e){const t=Object.create(null,{updated:{get:()=>super.updated}});return p(this,void 0,void 0,function*(){t.updated.call(this,e),null!=this.ihcproject&&this.ihcproject.Groups.map(e=>{var t=this.shadowRoot.getElementById(`group_${e.Id}`);t&&(t.data=e,t.chosenIcons=this.groupIcons)})})}onCardExpanded(e){var t;const o=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.node;for(let e of this.groupNodes())e!==o&&e.collapse()}onNodeCollapsed(){this.clearSelection()}clearSelection(){this.selected&&(this.selected.selected=n.Selection.NotSelected,this.selected=null),this.onselected&&(this.onselected.selected=n.Selection.NotSelected,this.onselected=null),this.offselected&&(this.offselected.selected=n.Selection.NotSelected,this.offselected=null);var e=this.shadowRoot.getElementById("ihcproperties");e&&e.setSelected(null)}onPickIcon(e){var t,o;const i=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.node;i&&this.shadowRoot.getElementById("icon-dlg").open(i.data.Id,i.data.Name,null===(o=this.groupIcons)||void 0===o?void 0:o[i.data.Id])}onIconChosen(){return p(this,void 0,void 0,function*(){const e=this.shadowRoot.getElementById("icon-dlg"),t=s.IHCManager.instance.get(this.controllerId);if(yield t.setGroupIcon(e.groupId,e.icon)){this.groupIcons=yield t.getGroupIcons();for(let e of this.groupNodes())e.chosenIcons=this.groupIcons,e.requestUpdate()}else this.loadError=(0,d.k)("icon_save_failed")})}groupNodes(){return null==this.ihcproject?[]:this.ihcproject.Groups.map(e=>this.shadowRoot.getElementById(`group_${e.Id}`)).filter(e=>null!=e)}loadController(){return p(this,void 0,void 0,function*(){this.isProjectLoading=!0,this.loadError=null;try{const e=s.IHCManager.instance.get(this.controllerId);this.ihcmapping=yield e.getMapping();for(let e in this.ihcmapping)if("changed"in this.ihcmapping[e]){this.dispatchEvent(new CustomEvent("reloadneeded",{bubbles:!0,composed:!0}));break}this.groupIcons=yield e.getGroupIcons(),this.ihcproject=yield e.getProject(),this.projectInfo=e.projectInfo,this.systemInfo=yield e.getSystemInfo(),this.ihcproject&&this.updateProject(this.ihcproject)}catch(e){this.loadError=`${e}`}finally{this.isProjectLoading=!1}})}onChanged(e){var t,o,i;null===(o=null===(t=e.detail)||void 0===t?void 0:t.wait)||void 0===o||o.push(this.refreshAfterReload()),!1===(null===(i=e.detail)||void 0===i?void 0:i.reloaded)&&this.dispatchEvent(new CustomEvent("reloadneeded",{bubbles:!0,composed:!0}))}refreshAfterReload(){return p(this,void 0,void 0,function*(){if(s.IHCManager.instance.get(this.controllerId).clearMapping(),this.ihcmapping=yield s.IHCManager.instance.get(this.controllerId).getMapping(),null!=this.ihcproject){this.updateProject(this.ihcproject);for(let t of this.ihcproject.Groups){var e=this.shadowRoot.getElementById(`group_${t.Id}`);e&&e.refresh()}if(this.selected){var t=this.shadowRoot.getElementById("ihcproperties");yield t.setSelected(this.selected)}}})}updateProject(e){for(let t of e.Groups){t.Children=[];for(let e of t.Products){t.Children.push(e),e.Children=[];for(let o of e.Inputs)e.Children.push(o),this.markResource(o,e,t),o.Product=e;for(let o of e.Outputs)e.Children.push(o),this.markResource(o,e,t),o.Product=e}for(let e of t.FunctionBlocks){t.Children.push(e),e.Children=[];for(let o of e.Inputs)e.Children.push(o),this.markResource(o,e,t);for(let o of e.Outputs)e.Children.push(o),this.markResource(o,e,t)}}this.ihcproject=e,this.computeFilter()}markResource(e,t,o){e.Parent=t,e.Group=o;const i=this.ihcmapping[e.Id];e.connected=void 0!==i,e.entity_id=(null==i?void 0:i.entity_id)||"",e.platform=(0,l.tj)(e.entity_id),e.friendlyName=this.friendlyName(e.entity_id)}friendlyName(e){var t,o,i;if(!e)return"";const r=null===(o=null===(t=s.IHCManager.instance.hass)||void 0===t?void 0:t.states)||void 0===o?void 0:o[e];return(null===(i=null==r?void 0:r.attributes)||void 0===i?void 0:i.friendly_name)||""}onSelectNode(e){return p(this,void 0,void 0,function*(){var t,o,i,r=this.shadowRoot.getElementById("ihcproperties"),s=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.node;if(this.selected&&e.detail.shiftKey){if(this.selected==s)return!1;if(this.offselected)return!1;if(this.onselected){if(this.onselected==s)return!1;this.offselected=s,s.selected=n.Selection.OffIdSelected}else this.onselected=s,s.selected=n.Selection.OnIdSelected;return r.setSelected(this.selected,null===(o=this.onselected)||void 0===o?void 0:o.data.Id,null===(i=this.offselected)||void 0===i?void 0:i.data.Id),!1}return this.clearSelection(),null==s||(this.selected=s,this.selected.selected=n.Selection.Selected,s.data instanceof a.xC&&r.setSelected(this.selected)),!1})}selectTab(e){var t=e.target.attributes["data-tabid"].value;this.selectedtab=t}};h([(0,i.MZ)({type:Boolean,attribute:!0})],u.prototype,"show",void 0),h([(0,i.MZ)({type:String,attribute:!0})],u.prototype,"controllerId",void 0),h([(0,i.MZ)({type:Boolean,attribute:!1})],u.prototype,"isProjectLoading",void 0),h([(0,i.MZ)({type:String,attribute:!1})],u.prototype,"loadError",void 0),h([(0,i.MZ)({type:Object,attribute:!1})],u.prototype,"systemInfo",void 0),h([(0,i.MZ)({type:Object,attribute:!1})],u.prototype,"projectInfo",void 0),h([(0,i.MZ)({type:Object,attribute:!1})],u.prototype,"groupIcons",void 0),h([(0,i.MZ)({type:Object,attribute:!1})],u.prototype,"selected",void 0),h([(0,i.MZ)({type:Object,attribute:!1})],u.prototype,"onselected",void 0),h([(0,i.MZ)({type:Object,attribute:!1})],u.prototype,"offselected",void 0),h([(0,i.MZ)({type:Number,attribute:!1})],u.prototype,"selectedtab",void 0),h([(0,i.MZ)({type:String,attribute:!1})],u.prototype,"filterText",void 0),h([(0,i.MZ)({type:String,attribute:!1})],u.prototype,"filterProduct",void 0),h([(0,i.MZ)({type:Number,attribute:!1})],u.prototype,"filterHits",void 0),u=h([(0,i.EM)("ihc-controller")],u)}};
//# sourceMappingURL=element-controller.js.map