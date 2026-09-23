/*
  IHC Viewer's own icon set - "ihcviewer:logo", the icon in the sidebar.

  The same drawing as brand/icon.png - a house with a magnifying glass and an
  eye - as one path on a 24x24 grid, so it takes the sidebar's colour like any
  other icon. The eye is a little taller and the pupil a little smaller than
  in the logo; at 24 pixels the logo's own eye runs together.

  The file stands alone, without a single import, and Home Assistant serves it
  from a fixed address with no version in it (/ihcviewer_icons/). Both on
  purpose. Home Assistant looks a custom icon set up once - just as the icon is
  drawn - and never tries again (frontend/src/components/ha-icon.ts). The
  sidebar is drawn while the rest of the page is still loading, so there is a
  race, and losing it leaves IHC Viewer without an icon until the page is
  reloaded. Hence one small file with no imports to wait for, and an address
  that is the same from version to version, so the browser has it from the
  last visit.

  The address is cached in the browser. If the icon changes, the file needs a
  new name, or anyone who has been here before keeps the old icon for a while.
*/

const ICONS = {
  logo:
    // The house: left wall, roof, right wall with the gap under the eave, bottom
    "M1.52 22.12L1.52 10.39L3.43 10.39L3.43 22.12ZM1.84 9.67L11.33 1.31L12.59 2.74L3.11 11.11Z" +
    "M12.6 1.31L22.13 9.79L20.86 11.21L11.33 2.74Z" +
    "M1.52 22.12A0.95 0.95 0 1 1 3.43 22.12A0.95 0.95 0 1 1 1.52 22.12Z" +
    "M1.52 10.39A0.95 0.95 0 1 1 3.43 10.39A0.95 0.95 0 1 1 1.52 10.39Z" +
    "M11.01 2.03A0.95 0.95 0 1 1 12.92 2.03A0.95 0.95 0 1 1 11.01 2.03Z" +
    "M20.54 10.5A0.95 0.95 0 1 1 22.45 10.5A0.95 0.95 0 1 1 20.54 10.5Z" +
    "M22.42 13.61L22.42 22.12L20.51 22.12L20.51 13.61ZM21.46 23.07L2.48 23.07L2.48 21.17L21.46 21.17Z" +
    "M20.51 13.61A0.95 0.95 0 1 1 22.42 13.61A0.95 0.95 0 1 1 20.51 13.61Z" +
    "M20.51 22.12A0.95 0.95 0 1 1 22.42 22.12A0.95 0.95 0 1 1 20.51 22.12Z" +
    // The magnifying glass: the ring, with its hole going the other way, and the handle
    "M6.57 13.09A5.05 5.05 0 1 1 16.68 13.09A5.05 5.05 0 1 1 6.57 13.09Z" +
    "M7.97 13.09A3.65 3.65 0 1 0 15.27 13.09A3.65 3.65 0 1 0 7.97 13.09Z" +
    "M15.54 15.53L18.64 18.63L17.17 20.11L14.06 17.01Z" +
    "M16.86 19.37A1.04 1.04 0 1 1 18.95 19.37A1.04 1.04 0 1 1 16.86 19.37Z" +
    // The eye, and the pupil as a hole in it
    "M8.65 13.09A3.22 3.22 0 0 1 14.59 13.09A3.22 3.22 0 0 1 8.65 13.09Z" +
    "M10.72 13.09A0.9 0.9 0 1 0 12.52 13.09A0.9 0.9 0 1 0 10.72 13.09Z",
};

window.customIcons = window.customIcons || {};
window.customIcons.ihcviewer = {
  getIcon: async (name) => ({ path: ICONS[name] || "" }),
  getIconList: async () => Object.keys(ICONS).map((name) => ({ name, keywords: ["ihc", "ihc viewer"] })),
};

/*
  And if the race is lost anyway, this tidies up after it.

  An <ha-icon> that did not find the set draws an <iron-icon> - an element Home
  Assistant does not have, hence the empty space in the sidebar. The element
  only fetches the icon again when "icon" changes, and even that is not enough
  on its own: setting the same icon again takes the branch for custom icon
  sets, and that branch never takes the element out of the old state.

  The way round uses only ordinary properties, not Home Assistant's insides:
  first set an mdi icon - that branch tidies up by itself - wait for it to be
  drawn, and then set ours back. Elements that made it have no <iron-icon> and
  are not touched, so this can run several times without flickering.
*/
function collectLost(root, found) {
  const all = root.querySelectorAll("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if (el.localName === "ha-icon") {
      const ours = typeof el.icon === "string" && el.icon.slice(0, 10) === "ihcviewer:";
      if (ours && el.shadowRoot && el.shadowRoot.querySelector("iron-icon")) found.push(el);
    } else if (el.shadowRoot) {
      collectLost(el.shadowRoot, found);
    }
  }
}

async function redraw() {
  const found = [];
  try {
    collectLost(document.body, found);
  } catch (_err) {
    return;
  }
  for (const el of found) {
    const icon = el.icon;
    el.icon = "mdi:file-tree";
    try {
      await el.updateComplete;
    } catch (_err) {
      // An element that is not a lit element yet has nothing to wait for.
    }
    el.icon = icon;
  }
}

// The sidebar may be drawn before us, at the same time, or just after. Four
// tries over three seconds cover all of them, and the last three cost nothing
// when the first one worked.
if (typeof document !== "undefined") {
  [0, 300, 1000, 3000].forEach((ms) => setTimeout(redraw, ms));
}
