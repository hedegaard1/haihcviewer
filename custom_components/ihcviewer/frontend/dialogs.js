export const __webpack_esm_id__=890;export const __webpack_esm_ids__=[890];export const __webpack_esm_modules__={531(t,e,o){o.r(e),o.d(e,{IhcBinaryResourceDialog:()=>c});var i=o(791),n=o(805),r=o(174),s=o(202),a=o(503),l=function(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s};const d=["battery","battery_charging","cold","connectivity","door","garage_door","gas","heat","light","lock","moisture","motion","moving","occupancy","opening","plug","power","presence","safety","smoke","sound","vibration","window"];let c=class extends n.IhcResourceDialog{constructor(){super(),this.title=(0,s.k)("dlg_binary_sensor_title")}static get styles(){return super.styles.concat([r.AH`
        #type {
          width: 100%;
        }
      `,,])}render_controls(){return r.qy`
      <div class="control-row">
        <input id="inverted" type="checkbox"/><label for="inverted">${(0,s.k)("dlg_inverted")}</label>
      </div>
      <div class="control-row">
        <div>${(0,s.k)("dlg_type")}</div>
        <select id="type">
          <option value=""></option>
          ${this.deviceClasses().map(({deviceClass:t,label:e})=>r.qy`<option value="${t}">${e}</option>`)}
        </select>
      </div>
    `}deviceClasses(){var t;const e=null===(t=a.IHCManager.instance)||void 0===t?void 0:t.hass;return d.map(t=>{var o;const i=null===(o=null==e?void 0:e.localize)||void 0===o?void 0:o.call(e,`component.binary_sensor.entity_component.${t}.name`);return{deviceClass:t,label:i?`${i} (${t})`:t}}).sort((t,o)=>{var i;return t.label.localeCompare(o.label,null===(i=null==e?void 0:e.locale)||void 0===i?void 0:i.language)})}onOk(){const t=Object.create(null,{onOk:{get:()=>super.onOk}});return e=this,o=void 0,n=function*(){this.inverted=this.shadowRoot.getElementById("inverted").checked,this.type=this.shadowRoot.getElementById("type").value,t.onOk.call(this)},new((i=void 0)||(i=Promise))(function(t,r){function s(t){try{l(n.next(t))}catch(t){r(t)}}function a(t){try{l(n.throw(t))}catch(t){r(t)}}function l(e){var o;e.done?t(e.value):(o=e.value,o instanceof i?o:new i(function(t){t(o)})).then(s,a)}l((n=n.apply(e,o||[])).next())});var e,o,i,n}};l([(0,i.MZ)({type:Boolean,attribute:!1})],c.prototype,"inverted",void 0),l([(0,i.MZ)({type:String,attribute:!1})],c.prototype,"type",void 0),c=l([(0,i.EM)("ihc-binary-res-dlg")],c)},320(t,e,o){o.r(e),o.d(e,{IhcIconDialog:()=>p});var i=o(174),n=o(791),r=o(805),s=o(958),a=o(503),l=o(202),d=function(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s},c=function(t,e,o,i){return new(o||(o=Promise))(function(n,r){function s(t){try{l(i.next(t))}catch(t){r(t)}}function a(t){try{l(i.throw(t))}catch(t){r(t)}}function l(t){var e;t.done?n(t.value):(e=t.value,e instanceof o?e:new o(function(t){t(e)})).then(s,a)}l((i=i.apply(t,e||[])).next())})};let p=class extends i.WF{constructor(){super(...arguments),this.groupName="",this.icon="",this.pickerReady=!1}static get styles(){return r.IhcResourceDialog.styles.concat(i.AH`
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
    `)}render(){return i.qy`
      <div id="dlgmask"></div>
      <div id="dlg" class="dlg">
        <div class="dlgtitle">${(0,l.k)("dlg_icon_title",this.groupName)}</div>
        <div class="coloumn">
          <div class="iconrow">
            <ha-icon .icon=${this.icon||s.y2}></ha-icon>
            ${this.render_field()}
          </div>
          ${this.pickerReady?"":i.qy`<div class="hint">${(0,l.k)("dlg_icon_hint")}</div>`}
        </div>
        <div class="buttonrow">
          <button @click=${this.onOk}>${(0,l.k)("dlg_ok")}</button>
          <button @click=${this.onClear}>${(0,l.k)("dlg_icon_clear")}</button>
          <button @click=${this.onCancel}>${(0,l.k)("dlg_cancel")}</button>
        </div>
      </div>`}render_field(){var t;return this.pickerReady?i.qy`<ha-icon-picker
        .hass=${null===(t=a.IHCManager.instance)||void 0===t?void 0:t.hass}
        .value=${this.icon}
        .placeholder=${s.y2}
        @value-changed=${this.onPicked}></ha-icon-picker>`:i.qy`<input id="icon" type="text" placeholder="${s.y2}"
      .value=${this.icon} @input=${this.onInput}/>`}open(t,e,o){return c(this,void 0,void 0,function*(){this.groupId=t,this.groupName=e,this.icon=o||"",this.shadowRoot.getElementById("dlgmask").style.display="block",this.shadowRoot.getElementById("dlg").style.display="block",this.pickerReady=yield function(){return c(this,void 0,void 0,function*(){if(customElements.get("ha-icon-picker"))return!0;try{const t=yield window.loadCardHelpers(),e=yield t.createCardElement({type:"entities",entities:[]}),o=null==e?void 0:e.constructor;(null==o?void 0:o.getConfigElement)&&(yield o.getConfigElement())}catch(t){return!1}return yield Promise.race([customElements.whenDefined("ha-icon-picker"),new Promise(t=>setTimeout(t,2e3))]),!!customElements.get("ha-icon-picker")})}()})}close(){this.shadowRoot.getElementById("dlgmask").style.display="none",this.shadowRoot.getElementById("dlg").style.display="none"}onPicked(t){var e;this.icon=(null===(e=t.detail)||void 0===e?void 0:e.value)||""}onInput(t){this.icon=t.target.value}onOk(){this.close(),this.dispatchEvent(new CustomEvent("ok"))}onClear(){this.icon="",this.close(),this.dispatchEvent(new CustomEvent("ok"))}onCancel(){this.close()}};d([(0,n.MZ)({type:Number,attribute:!1})],p.prototype,"groupId",void 0),d([(0,n.MZ)({type:String,attribute:!1})],p.prototype,"groupName",void 0),d([(0,n.MZ)({type:String,attribute:!1})],p.prototype,"icon",void 0),d([(0,n.MZ)({type:Boolean,attribute:!1})],p.prototype,"pickerReady",void 0),p=d([(0,n.EM)("ihc-icon-dlg")],p)},17(t,e,o){o.r(e),o.d(e,{IhcRemoveDialog:()=>p});var i=o(174),n=o(791),r=o(805),s=o(503),a=o(202),l=o(450),d=function(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s},c=function(t,e,o,i){return new(o||(o=Promise))(function(n,r){function s(t){try{l(i.next(t))}catch(t){r(t)}}function a(t){try{l(i.throw(t))}catch(t){r(t)}}function l(t){var e;t.done?n(t.value):(e=t.value,e instanceof o?e:new o(function(t){t(e)})).then(s,a)}l((i=i.apply(t,e||[])).next())})};o(560);let p=class extends i.WF{constructor(){super(...arguments),this.entityId="",this.name="",this.uses=[],this.checking=!1,this.lookupFailed=!1}static get styles(){return r.IhcResourceDialog.styles.concat(i.AH`
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
    `)}render(){return i.qy`
      <div id="dlgmask"></div>
      <div id="dlg" class="dlg">
        <div class="dlgtitle">${(0,a.k)("remove_dlg_title")}</div>
        <div class="coloumn">
          <div class="lead">${(0,a.k)("remove_dlg_text",this.name)}</div>
          ${(0,l.fy)(this.entityId)?i.qy`<div class="entity">${this.entityId}</div>`:""}
          ${this.renderUses()}
        </div>
        <div class="buttonrow">
          <button class="danger" ?disabled=${this.checking}
            @click=${this.onOk}>${(0,a.k)("remove_dlg_ok")}</button>
          <button @click=${this.onCancel}>${(0,a.k)("dlg_cancel")}</button>
        </div>
      </div>`}renderUses(){return(0,l.fy)(this.entityId)?this.checking?i.qy`<div class="checking"><ihc-loader small></ihc-loader>${(0,a.k)("remove_dlg_checking")}</div>`:this.lookupFailed?i.qy`<div class="hint">${(0,a.k)("remove_dlg_lookup_failed")}</div>`:i.qy`
      ${this.uses.length?i.qy`
        <div class="warning">${(0,a.k)("remove_dlg_used")}</div>
        ${this.uses.map(([t,e])=>i.qy`
          <div class="kind">${(0,a.k)(`used_${t}`)}</div>
          <ul>${e.map(t=>i.qy`<li>${t}</li>`)}</ul>`)}
      `:i.qy`<div>${(0,a.k)("remove_dlg_unused")}</div>`}
      <div class="hint">${(0,a.k)("remove_dlg_not_checked")}</div>`:""}open(t,e){return c(this,void 0,void 0,function*(){if(this.entityId=t||"",this.name=e||this.entityId,this.uses=[],this.lookupFailed=!1,this.checking=(0,l.fy)(this.entityId),this.shadowRoot.getElementById("dlgmask").style.display="block",this.shadowRoot.getElementById("dlg").style.display="block",!this.checking)return;const o=this.entityId;let i=[],n=!1;try{i=yield this.lookUp(o)}catch(t){n=!0}this.entityId===o&&(this.uses=i,this.lookupFailed=n,this.checking=!1)})}lookUp(t){return c(this,void 0,void 0,function*(){const e=s.IHCManager.instance.hass,[o,i]=yield Promise.all([e.callWS({type:"search/related",item_type:"entity",item_id:t}),this.dashboardsUsing(e,t)]),n=t=>t.map(t=>{var o,i;return(null===(i=null===(o=e.states[t])||void 0===o?void 0:o.attributes)||void 0===i?void 0:i.friendly_name)||t}).sort((t,e)=>t.localeCompare(e)),r=(0,l.XP)(o).map(([t,e])=>[t,n(e)]);return i.length&&r.push(["dashboard",i]),r})}dashboardsUsing(t,e){return c(this,void 0,void 0,function*(){const o=yield t.callWS({type:"lovelace/dashboards/list"}),i=o.some(t=>"lovelace"===t.url_path)?o:[{url_path:null,title:t.localize("panel.states")||"Overview"}].concat(o);return(yield Promise.all(i.map(o=>c(this,void 0,void 0,function*(){try{const i=yield t.callWS({type:"lovelace/config",url_path:o.url_path});return(0,l.Nu)(i,e)?o.title:null}catch(t){return null}})))).filter(t=>t)})}close(){this.shadowRoot.getElementById("dlgmask").style.display="none",this.shadowRoot.getElementById("dlg").style.display="none"}onOk(){this.close(),this.dispatchEvent(new CustomEvent("ok"))}onCancel(){this.close()}};d([(0,n.MZ)({type:String,attribute:!1})],p.prototype,"entityId",void 0),d([(0,n.MZ)({type:String,attribute:!1})],p.prototype,"name",void 0),d([(0,n.MZ)({attribute:!1})],p.prototype,"uses",void 0),d([(0,n.MZ)({type:Boolean,attribute:!1})],p.prototype,"checking",void 0),d([(0,n.MZ)({type:Boolean,attribute:!1})],p.prototype,"lookupFailed",void 0),p=d([(0,n.EM)("ihc-remove-dlg")],p)},805(t,e,o){o.r(e),o.d(e,{IhcResourceDialog:()=>d});var i,n=o(174),r=o(791),s=o(202),a=o(450),l=function(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s};let d=i=class extends n.WF{constructor(){super(...arguments),this.domain="",this.suggestedName="",this.nameDraft=""}static get button_style(){return n.AH`
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
      }`}static get styles(){return[i.button_style,n.AH`
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
    `]}render(){return n.qy`
      <div id="dlgmask"></div>
      <div id="dlg" class="dlg">
        <div class="dlgtitle">${this.title}</div>
        <div class="coloumn">
          <div class="control-row">
            <div>${(0,s.k)("dlg_resource_id",this.ihc_id)}</div>
          </div>
          ${this.on_id?n.qy`
            <div class="control-row">
              <div>on_id: ${this.on_id}</div>
            </div>
          `:""}
          ${this.off_id?n.qy`
            <div class="control-row">
              <div>off_id: ${this.off_id}</div>
            </div>
          `:""}
          <div class="control-row">
            <div>${(0,s.k)("dlg_name")}</div>
            <input id="name" type="text" .value=${this.nameDraft}
              @input=${t=>{this.nameDraft=t.target.value}}/>
            ${this.domain?n.qy`
              <div class="entitypreview">${(0,s.k)("dlg_entity_id_becomes",this.entityIdPreview())}</div>
            `:""}
          </div>
          ${this.render_controls()}
          <slot></slot>
        </div>
        <div class="buttonrow">
            <button @click=${this.onOk}>${(0,s.k)("dlg_ok")}</button>
            <button @click="${this.onCancel}">${(0,s.k)("dlg_cancel")}</button>
          </div>
      </div>
    `}render_controls(){return n.qy``}entityIdPreview(){const t=(0,a.Yv)(this.nameDraft);return`${this.domain}.${t}`}open(){this.nameDraft=this.suggestedName||"",this.shadowRoot.getElementById("dlgmask").style.display="block",this.shadowRoot.getElementById("dlg").style.display="block",this.updateComplete.then(()=>{const t=this.shadowRoot.getElementById("name");t&&(t.focus(),t.select())})}close(){this.shadowRoot.getElementById("dlgmask").style.display="none",this.shadowRoot.getElementById("dlg").style.display="none"}onOk(){return t=this,e=void 0,i=function*(){this.name=this.shadowRoot.getElementById("name").value.trim(),""!=this.name?(this.close(),this.dispatchEvent(new CustomEvent("ok"))):alert((0,s.k)("dlg_name_required"))},new((o=void 0)||(o=Promise))(function(n,r){function s(t){try{l(i.next(t))}catch(t){r(t)}}function a(t){try{l(i.throw(t))}catch(t){r(t)}}function l(t){var e;t.done?n(t.value):(e=t.value,e instanceof o?e:new o(function(t){t(e)})).then(s,a)}l((i=i.apply(t,e||[])).next())});var t,e,o,i}onCancel(){this.close()}};l([(0,r.MZ)({type:String,attribute:!1})],d.prototype,"controllerId",void 0),l([(0,r.MZ)({type:Number,attribute:!1})],d.prototype,"ihc_id",void 0),l([(0,r.MZ)({type:Number,attribute:!1})],d.prototype,"on_id",void 0),l([(0,r.MZ)({type:Number,attribute:!1})],d.prototype,"off_id",void 0),l([(0,r.MZ)({type:String})],d.prototype,"title",void 0),l([(0,r.MZ)({type:String,attribute:!1})],d.prototype,"name",void 0),l([(0,r.MZ)({type:String,attribute:!1})],d.prototype,"domain",void 0),l([(0,r.MZ)({type:String,attribute:!1})],d.prototype,"suggestedName",void 0),l([(0,r.MZ)({type:String,attribute:!1})],d.prototype,"nameDraft",void 0),d=i=l([(0,r.EM)("ihc-resource-dlg")],d)},348(t,e,o){o.r(e),o.d(e,{IhcSensorResourceDialog:()=>l});var i=o(791),n=o(805),r=o(174),s=o(202),a=function(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s};let l=class extends n.IhcResourceDialog{constructor(){super(),this.title=(0,s.k)("dlg_sensor_title")}static get styles(){return super.styles.concat(r.AH`
      `)}render_controls(){return r.qy`
      <div class="control-row">
        <div>${(0,s.k)("dlg_unit")}</div>
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
    `}onOk(){const t=Object.create(null,{onOk:{get:()=>super.onOk}});return e=this,o=void 0,n=function*(){this.unit=this.shadowRoot.getElementById("unit").value,t.onOk.call(this)},new((i=void 0)||(i=Promise))(function(t,r){function s(t){try{l(n.next(t))}catch(t){r(t)}}function a(t){try{l(n.throw(t))}catch(t){r(t)}}function l(e){var o;e.done?t(e.value):(o=e.value,o instanceof i?o:new i(function(t){t(o)})).then(s,a)}l((n=n.apply(e,o||[])).next())});var e,o,i,n}};a([(0,i.MZ)({type:String,attribute:!1})],l.prototype,"unit",void 0),l=a([(0,i.EM)("ihc-sensor-res-dlg")],l)}};
//# sourceMappingURL=dialogs.js.map