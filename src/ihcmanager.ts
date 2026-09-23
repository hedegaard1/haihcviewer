import { IHCProject } from "./ihcproject";
import { keepProject, revisionOf } from "./logic";

/*
IHCManager is a singleton. use IHCManager.instance
*/
export class IHCManager {

  private _hass;
  private static theoneandonly;
  private controllers: { [controllerId: string]: IHCController };

  private constructor(hass) {
    this._hass = hass;
    this.controllers = {};
  }

  static initialize(hass) {
    // Keep the existing instance so the project we have already downloaded is
    // reused when the panel is opened again. Only the hass object is refreshed,
    // because the access token we authenticate with lives on it.
    if (IHCManager.theoneandonly) {
      IHCManager.theoneandonly._hass = hass;
      return;
    }
    IHCManager.theoneandonly = new IHCManager(hass)
  }

  static get instance(): IHCManager {
    return IHCManager.theoneandonly;
  }

  get hass() {
    return this._hass;
  }

  get(controllerId) {
    if (!(controllerId in this.controllers)) {
      this.controllers[controllerId] = new IHCController(controllerId);
    }
    return this.controllers[controllerId];
  }

  async fetchWithAuth(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    let auth = this.hass.connection.options.auth;
    if (auth.expired) {
      await auth.refreshAccessToken();
    }
    if (!init.headers) {
      init.headers = {};
    }
    init.headers['authorization'] = `Bearer ${auth.accessToken}`;
    return await fetch(input, init);

  }
}

class IHCController {

  private controllerId: string;
  private project: IHCProject;
  private projectRevision: string;
  private ihcmapping;
  private groupIcons = null;
  // What the controller last told us about the project it is running, and
  // about itself. Both are shown in the panel.
  public projectInfo = null;
  public systemInfo = undefined;

  constructor(controllerId: string) {

    this.controllerId = controllerId;
    this.project = null;
    this.projectRevision = null;
    this.ihcmapping = null;
  }

  // Get the project. It is kept both here and on the server, because reading
  // it from the controller takes a while - well over a megabyte of xml. So
  // first we ask the controller which project it is running, which is a small
  // request, and only read the whole thing again when that is not the one we
  // are holding - see keepProject.
  async getProject(): Promise<IHCProject> {

    let revision = await this.getProjectRevision();
    if (keepProject(this.project != null, this.projectRevision, revision)) {
      return this.project;
    }
    let url = `/api/ihcviewer/project/${this.controllerId}`;
    let response = await IHCManager.instance.fetchWithAuth(url);
    if (!response.ok) {
      throw new Error(`Could not read the ihc project (${response.status} ${response.statusText})`);
    }
    let projectdata = await response.text();
    let xmlparser = new DOMParser();
    let projectxml = xmlparser.parseFromString(projectdata, "text/xml");
    this.project = new IHCProject(projectxml);
    this.projectRevision = revision;
    return this.project;
  }

  // Which project the controller is running, as one string to compare on.
  // Null when it cannot be read, so a failure here never throws away a project
  // we already have, and "" when the controller reports none. What came back is
  // kept so the panel can show it.
  private async getProjectRevision(): Promise<string> {
    let response = await IHCManager.instance.fetchWithAuth(
      `/api/ihcviewer/projectinfo/${this.controllerId}`);
    if (!response.ok) {
      this.projectInfo = null;
      return null;
    }
    let info = await response.json();
    this.projectInfo = info;
    return revisionOf(info);
  }

  // What the controller says about itself. Read once - it is the hardware,
  // and that does not change while Home Assistant is running.
  async getSystemInfo() {
    if (this.systemInfo === undefined) {
      let response = await IHCManager.instance.fetchWithAuth(
        `/api/ihcviewer/systeminfo/${this.controllerId}`);
      this.systemInfo = response.ok ? await response.json() : null;
    }
    return this.systemInfo;
  }

  // Forget the mapping so it is fetched again. The project is kept - it comes
  // from the controller and does not change when the ihc integration reloads.
  // The icons someone has picked for the rooms, keyed by the room's ihc id.
  // They are kept by the integration rather than in the browser, so the rooms
  // look the same wherever the panel is opened.
  async getGroupIcons() {
    if (this.groupIcons == null) {
      let response = await IHCManager.instance.fetchWithAuth(
        `/api/ihcviewer/groupicons/${this.controllerId}`);
      this.groupIcons = response.ok ? await response.json() : {};
    }
    return this.groupIcons;
  }

  // Pick the icon for one room, or clear it with an empty string. The answer
  // is the whole set again, so there is one source of truth and no guessing
  // about what the store now holds.
  async setGroupIcon(groupId: number, icon: string): Promise<boolean> {
    let response = await IHCManager.instance.fetchWithAuth(
      `/api/ihcviewer/groupicons/${this.controllerId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupId, icon: icon }),
      });
    if (!response.ok) return false;
    this.groupIcons = await response.json();
    return true;
  }

  clearMapping() {
    this.ihcmapping = null;
  }

  async getMapping() {

    if (this.ihcmapping == null) {
      let response = await IHCManager.instance.fetchWithAuth(`/api/ihcviewer/mapping/${this.controllerId}`);
      if (!response.ok) {
        throw new Error(`Could not read the ihc mapping (${response.status} ${response.statusText})`);
      }
      this.ihcmapping = await response.json();
    }
    return this.ihcmapping;
  }


}