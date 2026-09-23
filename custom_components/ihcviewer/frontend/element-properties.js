export const __webpack_esm_id__=121;export const __webpack_esm_ids__=[121];export const __webpack_esm_modules__={999(e,t,i){i.r(t),i.d(t,{IhcPropertiesElement:()=>m});var o=i(791),n=i(805),s=i(522),a=i(503),r=i(360),d=i(781),l=i(958),c=i(202),h=i(450),p=i(174),u=function(e,t,i,o){var n,s=arguments.length,a=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var r=e.length-1;r>=0;r--)(n=e[r])&&(a=(s<3?n(a):s>3?n(t,i,a):n(t,i))||a);return s>3&&a&&Object.defineProperty(t,i,a),a},v=function(e,t,i,o){return new(i||(i=Promise))(function(n,s){function a(e){try{d(o.next(e))}catch(e){s(e)}}function r(e){try{d(o.throw(e))}catch(e){s(e)}}function d(e){var t;e.done?n(e.value):(t=e.value,t instanceof i?t:new i(function(e){e(t)})).then(a,r)}d((o=o.apply(e,t||[])).next())})};i(805),i(17),i(531),i(348),i(805),i(560);let m=class extends p.WF{static get styles(){return[n.IhcResourceDialog.button_style,p.AH`
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
    `]}render(){return this.working?p.qy`
        <div id="working">
          <ihc-loader></ihc-loader>
          <div>${(0,c.k)("working_update")}</div>
        </div>`:this.isLoading?p.qy`<ihc-loader/>`:null==this.selected?"":p.qy`
      ${this.renderHead()}
      <div id="sections" class="${this.canAdd()?"adding":""}">
        <section>
          <h4>${(0,c.k)("sec_ihc")}</h4>
          <div class="facts">${this.renderIhcFacts()}</div>
        </section>
        <section>
          <h4>${(0,c.k)("sec_hass")}</h4>
          ${this.renderHass()}
        </section>
        <section>
          <h4>${(0,c.k)(this.canAdd()?"sec_add":"sec_actions")}</h4>
          ${this.renderActions()}
        </section>
      </div>
      <ihc-binary-res-dlg id="binary-dlg" @ok=${this.makeBinarySensor}></ihc-binary-res-dlg>
      <ihc-resource-dlg id="light-dlg" @ok=${this.makeLight} title="${(0,c.k)("dlg_light_title")}"></ihc-resource-dlg>
      <ihc-resource-dlg id="switch-dlg" @ok=${this.makeSwitch} title="${(0,c.k)("dlg_switch_title")}"></ihc-resource-dlg>
      <ihc-sensor-res-dlg id="sensor-dlg" @ok=${this.makeSensor}></ihc-sensor-res-dlg>
      <ihc-remove-dlg id="remove-dlg" @ok=${this.doRemove}></ihc-remove-dlg>
      `}renderHead(){var e,t;const i=null===(e=this.selectednode)||void 0===e?void 0:e.data,o=[null==i?void 0:i.Position,null==i?void 0:i.Note].filter(e=>e).join(" · ");return p.qy`
      <div id="head">
        <ha-icon class="headicon" .icon=${(null===(t=this.selectednode)||void 0===t?void 0:t.icon())||"mdi:circle-small"}></ha-icon>
        <span class="headname">${null==i?void 0:i.Name}</span>
        ${o?p.qy`<span class="headsub">${o}</span>`:""}
        <span class="spacer"></span>
        <ha-icon id="close" icon="mdi:close" title="${(0,c.k)("prop_close")}"
          @click=${this.onClose}></ha-icon>
      </div>`}renderIhcFacts(){var e,t;const i=null===(t=null===(e=this.selectednode)||void 0===e?void 0:e.data)||void 0===t?void 0:t.Product;return p.qy`
      <span class="factlabel">${(0,c.k)("prop_resource_id")}</span>
      <span class="factvalue">
        <span class="mono">${this.selected.id}</span>
        <span id="copyres" title="${(0,c.k)("prop_copy_title")}" @click=${this.onCopy}>
          <svg style="width: 16px; height: 16px" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
          </svg>
        </span>
      </span>
      <span class="factlabel">${(0,c.k)("prop_type")}</span>
      <span class="factvalue">${this.selected.type}</span>
      <span class="factlabel" title="${(0,c.k)("prop_value_title")}">${(0,c.k)("prop_value")}</span>
      <span class="factvalue">${`${this.selected.value}`}${this.renderValueActions()}</span>
      ${i?p.qy`
        <span class="factlabel">${(0,c.k)("prop_product")}</span>
        <span class="factvalue">${i.Name}</span>
        <span class="factlabel">${(0,c.k)("prop_product_type")}</span>
        <span class="factvalue">
          <span class="mono">${i.ProductIdentifier}</span>
          ${i.IhcIcon?p.qy`<span class="factlabel"> ${(0,c.k)("prop_ihc_icon",i.IhcIcon)}</span>`:""}
          ${(0,l.fG)(i)?"":p.qy`<span class="factlabel"> · ${(0,c.k)("prop_product_no_icon")}</span>`}
        </span>`:""}`}renderHass(){return this.selected.entity_id&&!(0,h.fy)(this.selected.entity_id)?p.qy`<div class="note">${(0,c.k)("not_updated_yet")}</div>`:this.selected.entity_id?p.qy`
      <div class="facts">
        <span class="factlabel">${(0,c.k)("prop_display_name")}</span>
        <span class="factvalue">${this.renderNameField()}</span>
        <span class="factlabel">${(0,c.k)("prop_entity")}</span>
        <span class="factvalue">${this.renderEntityIdField()}</span>
      </div>
      ${this.renameError?p.qy`<div class="warning">${(0,c.k)(this.renameError)}</div>`:""}
      ${this.isBinarySensor()?p.qy`<div class="note">${(0,c.k)("binary_sensor_help")}</div>`:""}`:p.qy`<div class="note">${(0,c.k)("not_in_hass")}</div>
        ${this.canAdd()?p.qy`
          <div class="note">${(0,c.k)("not_in_hass_how")}</div>`:""}
        ${this.selected.pending_removal?p.qy`
          <div class="note">${(0,c.k)("pending_removal_help")}</div>`:""}`}renderNameField(){return p.qy`
      <div class="editrow">
        <input id="namefield" type="text" .value=${this.nameDraft}
          placeholder="${(0,c.k)("name_placeholder")}"
          title="${(0,c.k)("prop_display_name_title")}"
          @input=${this.onNameInput}
          @change=${()=>this.saveName()}
          @keydown=${e=>{"Enter"===e.key&&e.target.blur()}}>
        ${this.renderStatus("name")}
      </div>`}renderEntityIdField(){return this.editingEntityId?p.qy`
      <div class="editrow">
        <input id="entityfield" class="mono" type="text" .value=${this.entityDraft}
          @input=${e=>{this.entityDraft=e.target.value}}
          @change=${()=>this.saveEntityId()}
          @keydown=${this.onEntityKey}>
        <button class="linkbutton" @mousedown=${this.cancelEditEntityId}>${(0,c.k)("rename_cancel")}</button>
      </div>
      <div class="warning">${(0,c.k)("entity_id_warning")}</div>`:p.qy`
        <div class="editrow">
          <span class="mono factvalue">${this.selected.entity_id}</span>
          <ha-icon class="iconbutton" icon="mdi:pencil" title="${(0,c.k)("rename_edit_id")}"
            @click=${this.startEditEntityId}></ha-icon>
          ${this.renderStatus("entity")}
        </div>`}renderStatus(e){return this.saving===e?p.qy`<span class="status"><ihc-loader small></ihc-loader> ${(0,c.k)("rename_saving")}</span>`:this.savedNow===e?p.qy`<span class="status saved">${(0,c.k)("rename_saved")}</span>`:""}canAdd(){return this.action_binary_sensor||this.action_light||this.action_sensor||this.action_switch}renderActions(){var e,t,i;const o=this.canAdd();return p.qy`
      <div class="actionlist">
        ${this.action_binary_sensor?this.addAction("binary-dlg","binary_sensor"):""}
        ${this.action_light?this.addAction("light-dlg","light"):""}
        ${this.action_sensor?this.addAction("sensor-dlg","sensor"):""}
        ${this.action_switch?this.addAction("switch-dlg","switch"):""}
        ${(null===(e=this.selected)||void 0===e?void 0:e.manual)?p.qy`
          <div class="action">
            <button class="remove" @click=${this.removeManual}>${(0,c.k)("remove_manual")}</button>
            <div class="note">${(0,c.k)("manual_help")}</div>
          </div>`:""}
      </div>
      ${this.changeError?p.qy`<div class="warning">${(0,c.k)(this.changeError)}</div>`:""}
      ${o?p.qy`<div class="note general">${(0,c.k)("add_help")}</div>`:""}
      ${o||(null===(t=this.selected)||void 0===t?void 0:t.manual)||!(null===(i=this.selected)||void 0===i?void 0:i.entity_id)?"":p.qy`
        <div class="note">${(0,c.k)("automatic_help")}</div>`}`}addAction(e,t){const i=("light"===t||"switch"===t)&&this.isInput();return p.qy`
      <div class="action">
        <button class="${i?"writes":""}"
          @click=${()=>{this.showDialog(e)}}>${(0,r.platformLabel)(t)}</button>
        <div class="note">${(0,c.k)(`add_${t}_help`)}</div>
        ${i?p.qy`<div class="note">${(0,c.k)("add_writes_input")}</div>`:""}
      </div>`}renderValueActions(){return"bool"==this.selected.type?p.qy`<span class="valueactions">
        <span @click=${this.runtimeBoolOn} title="${(0,c.k)("value_on_title")}">${(0,c.k)("value_on")}</span>
        <span @click=${this.runtimeBoolOff} title="${(0,c.k)("value_off_title")}">${(0,c.k)("value_off")}</span>
        <span @click=${this.runtimeBoolToggle} title="${(0,c.k)("value_toggle_title")}">${(0,c.k)("value_toggle")}</span>
      </span>`:""}constructor(){super(),this.isLoading=!1,this.working=!1,this.changeError="",this.selected=null,this.nameDraft="",this.savedName="",this.entityDraft="",this.editingEntityId=!1,this.saving="",this.savedNow="",this.renameError="",this.nameTimer=null,this.savedTimer=null,this.isLoading=!1}connectedCallback(){const e=Object.create(null,{connectedCallback:{get:()=>super.connectedCallback}});return v(this,void 0,void 0,function*(){e.connectedCallback.call(this)})}isBinarySensor(){var e;return"binary_sensor"===`${null===(e=this.selected)||void 0===e?void 0:e.entity_id}`.split(".")[0]}isInput(){var e;return(null===(e=this.selectednode)||void 0===e?void 0:e.data)instanceof d.pJ}onClose(){this.dispatchEvent(new CustomEvent("closeproperties",{bubbles:!0,composed:!0}))}setSelected(e){return v(this,arguments,void 0,function*(e,t=null,i=null){if(this.on_id=t,this.off_id=i,null==e)return this.selected=null,void(this.selectednode=null);e!==this.selectednode&&(this.changeError=""),this.selectednode=e;let o=e.data.Id;this.isLoading=!0,this.action_binary_sensor=!1,this.action_light=!1,this.action_sensor=!1,this.action_switch=!1;let n=yield a.IHCManager.instance.fetchWithAuth(`/api/ihcviewer/getresource/${this.controllerId}/${o}`);if(n.ok){if(this.selected=yield n.json(),null!=this.selected&&this.selected.type&&!this.selected.entity_id)switch(this.selected.type){case"bool":this.action_binary_sensor=null==t,this.action_light=!0,this.action_switch=!0;break;case"int":this.action_light=this.selectednode.data.IsLightLevel,this.action_sensor=null==t;break;case"time":case"float":this.action_sensor=!0}this.resetEditing()}this.isLoading=!1})}resetEditing(){var e,t,i,o;clearTimeout(this.nameTimer),this.nameTimer=null,this.savedName=(null===(i=null===(t=null===(e=this.selected)||void 0===e?void 0:e.state)||void 0===t?void 0:t.attributes)||void 0===i?void 0:i.friendly_name)||"",this.nameDraft=this.savedName,this.entityDraft=(null===(o=this.selected)||void 0===o?void 0:o.entity_id)||"",this.editingEntityId=!1,this.renameError="",this.savedNow=""}onNameInput(e){this.nameDraft=e.target.value,clearTimeout(this.nameTimer),this.nameTimer=setTimeout(()=>this.saveName(),800)}onEntityKey(e){"Enter"===e.key&&e.target.blur(),"Escape"===e.key&&this.cancelEditEntityId()}startEditEntityId(){this.entityDraft=this.selected.entity_id,this.renameError="",this.editingEntityId=!0,this.updateComplete.then(()=>{const e=this.shadowRoot.getElementById("entityfield");e&&e.focus()})}cancelEditEntityId(){this.entityDraft=this.selected.entity_id,this.renameError="",this.editingEntityId=!1}saveName(){return v(this,void 0,void 0,function*(){clearTimeout(this.nameTimer),this.nameTimer=null,this.nameDraft!==this.savedName&&(yield this.rename("name",{name:this.nameDraft}))&&(this.savedName=this.nameDraft)})}saveEntityId(){return v(this,void 0,void 0,function*(){const e=this.entityDraft.trim().toLowerCase();if(!e||e===this.selected.entity_id)return void this.cancelEditEntityId();const t=yield this.rename("entity",{new_entity_id:e});t&&(this.selected.entity_id=t.entity_id,this.entityDraft=t.entity_id,this.editingEntityId=!1,this.requestUpdate())})}rename(e,t){return v(this,void 0,void 0,function*(){this.saving=e,this.renameError="";let i=null;try{const e=yield a.IHCManager.instance.fetchWithAuth(`/api/ihcviewer/entity/${this.controllerId}`,{method:"POST",cache:"no-cache",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({id:this.selected.id,entity_id:this.selected.entity_id},t))}),o=yield e.json();e.ok?i=o:this.renameError=(null==o?void 0:o.error)||"rename_failed"}catch(e){this.renameError="rename_failed"}return this.saving="",i&&(this.savedNow=e,clearTimeout(this.savedTimer),this.savedTimer=setTimeout(()=>{this.savedNow=""},2500)),i})}showDialog(e){var t=this.shadowRoot.getElementById(e);t.controllerId=this.controllerId,t.ihc_id=this.selected.id,t.on_id=this.on_id,t.off_id=this.off_id,t.domain=this.dialogDomain(e),t.suggestedName=this.suggestedName(),t.open()}suggestedName(){var e;return(0,h.SX)(null===(e=this.selectednode)||void 0===e?void 0:e.data)}dialogDomain(e){switch(e){case"binary-dlg":return"binary_sensor";case"light-dlg":return"light";case"sensor-dlg":return"sensor";case"switch-dlg":return"switch"}return""}change(e,t){return v(this,void 0,void 0,function*(){this.working=!0,this.changeError="";let i=null;try{const o=yield a.IHCManager.instance.fetchWithAuth(e,{method:"POST",cache:"no-cache",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});i=yield o.json(),o.ok||(this.changeError=(null==i?void 0:i.error)||"change_failed")}catch(e){this.changeError="change_failed"}const o=[];this.dispatchEvent(new CustomEvent("changed",{bubbles:!0,composed:!0,detail:{reloaded:null==i?void 0:i.reloaded,wait:o}})),yield Promise.all(o),this.working=!1})}makeBinarySensor(){return v(this,void 0,void 0,function*(){const e=this.shadowRoot.getElementById("binary-dlg");yield this.change(`/api/ihcviewer/manual/binarysensor/${this.controllerId}`,{id:e.ihc_id,name:e.name,type:e.type,inverted:e.inverted})})}makeLight(){return v(this,void 0,void 0,function*(){var e;const t=this.shadowRoot.getElementById("light-dlg");yield this.change(`/api/ihcviewer/manual/light/${this.controllerId}`,this.withOnOff(t,{id:t.ihc_id,name:t.name,dimmable:"int"===(null===(e=this.selected)||void 0===e?void 0:e.type)}))})}makeSwitch(){return v(this,void 0,void 0,function*(){const e=this.shadowRoot.getElementById("switch-dlg");yield this.change(`/api/ihcviewer/manual/switch/${this.controllerId}`,this.withOnOff(e,{id:e.ihc_id,name:e.name}))})}makeSensor(){return v(this,void 0,void 0,function*(){const e=this.shadowRoot.getElementById("sensor-dlg");yield this.change(`/api/ihcviewer/manual/sensor/${this.controllerId}`,{id:e.ihc_id,name:e.name,unit:e.unit})})}withOnOff(e,t){return null!=e.on_id&&(t.on_id=e.on_id),null!=e.off_id&&(t.off_id=e.off_id),t}removeManual(){var e,t;this.shadowRoot.getElementById("remove-dlg").open(this.selected.entity_id,this.savedName||(null===(t=null===(e=this.selectednode)||void 0===e?void 0:e.data)||void 0===t?void 0:t.Name))}doRemove(){return v(this,void 0,void 0,function*(){yield this.change(`/api/ihcviewer/manual/remove/${this.controllerId}/${this.selected.id}`,{})})}runtimeBoolOn(){return v(this,void 0,void 0,function*(){var e=this.selected.id;"on"==(yield this.apiRequest(`/api/ihcviewer/setboolresource/${this.controllerId}/${e}/on`,"","POST"))&&(this.selected.value=!0,this.requestUpdate())})}runtimeBoolOff(){return v(this,void 0,void 0,function*(){var e=this.selected.id;"off"==(yield this.apiRequest(`/api/ihcviewer/setboolresource/${this.controllerId}/${e}/off`,"","POST"))&&(this.selected.value=!1,this.requestUpdate())})}runtimeBoolToggle(){return v(this,void 0,void 0,function*(){var e=this.selected.id;yield this.apiRequest(`/api/ihcviewer/setboolresource/${this.controllerId}/${e}/toggle`,"","POST")})}apiRequest(e,t){return v(this,arguments,void 0,function*(e,t,i="GET"){let o=yield a.IHCManager.instance.fetchWithAuth(e,{method:i,cache:"no-cache",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});return o.ok?yield o.text():"error"})}onCopy(){(0,s.e)(this.selected.id)}};u([(0,o.MZ)({type:String})],m.prototype,"controllerId",void 0),u([(0,o.MZ)({type:Boolean,attribute:!1})],m.prototype,"isLoading",void 0),u([(0,o.MZ)({type:Boolean,attribute:!1})],m.prototype,"working",void 0),u([(0,o.MZ)({type:String,attribute:!1})],m.prototype,"changeError",void 0),u([(0,o.MZ)({type:Object,attribute:!1})],m.prototype,"selected",void 0),u([(0,o.MZ)({type:String,attribute:!1})],m.prototype,"nameDraft",void 0),u([(0,o.MZ)({type:String,attribute:!1})],m.prototype,"savedName",void 0),u([(0,o.MZ)({type:String,attribute:!1})],m.prototype,"entityDraft",void 0),u([(0,o.MZ)({type:Boolean,attribute:!1})],m.prototype,"editingEntityId",void 0),u([(0,o.MZ)({type:String,attribute:!1})],m.prototype,"saving",void 0),u([(0,o.MZ)({type:String,attribute:!1})],m.prototype,"savedNow",void 0),u([(0,o.MZ)({type:String,attribute:!1})],m.prototype,"renameError",void 0),m=u([(0,o.EM)("ihc-properties")],m)}};
//# sourceMappingURL=element-properties.js.map