export const __webpack_esm_id__=84;export const __webpack_esm_ids__=[84];export const __webpack_esm_modules__={480(e,t,o){o.r(t),o.d(t,{IhcLogElement:()=>c});var i=o(791),r=o(503),n=o(202),a=o(174),l=function(e,t,o,i){var r,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,o,a):r(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a},s=function(e,t,o,i){return new(o||(o=Promise))(function(r,n){function a(e){try{s(i.next(e))}catch(e){n(e)}}function l(e){try{s(i.throw(e))}catch(e){n(e)}}function s(e){var t;e.done?r(e.value):(t=e.value,t instanceof o?t:new o(function(e){e(t)})).then(a,l)}s((i=i.apply(e,t||[])).next())})};o(560);let c=class extends a.WF{static get styles(){return a.AH`
      #log {
        padding-left: 10px;
        padding-right: 10px;
        padding-top: 10px;
      }
    `}render(){return a.qy`
      <div id="log">
        ${this.isLogLoading?a.qy`<ihc-loader/>`:""}
        <pre id="ihc_log">${""==this.log?(0,n.k)("no_log_data"):this.log}</pre>
      </div>
    `}constructor(){super(),this.log="",this.isLogLoading=!1,this.isLogLoading=!1,this.log=""}connectedCallback(){const e=Object.create(null,{connectedCallback:{get:()=>super.connectedCallback}});return s(this,void 0,void 0,function*(){e.connectedCallback.call(this),this.logRequest()})}logRequest(){return s(this,void 0,void 0,function*(){this.isLogLoading=!0;try{let e=yield r.IHCManager.instance.fetchWithAuth(`/api/ihcviewer/log/${this.controllerId}`);if(e.ok){let t=yield e.text();this.log=""==t?(0,n.k)("log_is_empty"):t}}finally{this.isLogLoading=!1}})}};l([(0,i.MZ)({type:String,reflect:!0})],c.prototype,"controllerId",void 0),l([(0,i.MZ)({type:String,attribute:!1})],c.prototype,"log",void 0),l([(0,i.MZ)({type:Boolean,attribute:!1})],c.prototype,"isLogLoading",void 0),c=l([(0,i.EM)("ihc-log")],c)},560(e,t,o){o.r(t),o.d(t,{LoaderElement:()=>a});var i=o(174),r=o(791),n=function(e,t,o,i){var r,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,o,a):r(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};let a=class extends i.WF{static get styles(){return i.AH`
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      :host([small]) .loader {
        width: 12px;
        height: 12px;
        border-width: 2px;
      }
      /* The same thin ring Home Assistant itself shows while it is starting,
         so a panel that is still loading looks like the rest of the house
         rather than like a different program.

         In the theme's own colour. It used to be #3498db on #f3f3f3, which
         was blue whatever the theme said, and the near-white track sat as a
         bright ring on a dark background. There is no track now - the gap in
         the arc is what shows it is turning. */
      .loader {
        width: 48px;
        height: 48px;
        border: 5px solid var(--primary-color);
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}render(){return i.qy`<div class="loader"></div>`}constructor(){super(),this.small=!1}};n([(0,r.MZ)({type:Boolean,reflect:!0})],a.prototype,"small",void 0),a=n([(0,r.EM)("ihc-loader")],a)}};
//# sourceMappingURL=elements.js.map