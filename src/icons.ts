// Icons for what the ihc project describes. Home Assistant's own ha-icon
// draws them, so the whole material set is available without bundling it.

import { IHCGroup, IHCProduct } from "./ihcproject";

// The product types an ihc project uses. The identifier is the product itself,
// not what someone named it, so a renamed product keeps the right icon.
//
// Everything the ihc integration's own ihc_auto_setup.yaml knows about is in
// here, using its names, so the two stay recognisable side by side. There is
// no published list of every identifier ihc has, so this table can only grow
// as products turn up - see BY_IHC_ICON for what happens meanwhile.
const BY_PRODUCT: { [identifier: string]: string } = {
  // Dataline - sensors and detectors
  "_0x0": "mdi:motion-sensor",           // Pir sensor, twilight
  "_0x2109": "mdi:door-open",            // Magnet contact
  "_0x210a": "mdi:smoke-detector",       // Smoke detector
  "_0x210c": "mdi:water-alert",          // Leak detector
  "_0x210e": "mdi:motion-sensor",        // Pir sensor
  "_0x210f": "mdi:motion-sensor",        // Pir sensor, alarm
  "_0x2110": "mdi:weather-sunset",       // Light detector
  "_0x2124": "mdi:thermometer",          // Temperature sensor
  "_0x2135": "mdi:water-percent",        // Humidity and temperature
  "_0x2136": "mdi:brightness-5",         // Lux and temperature

  // Dataline - buttons and keypads
  "_0x2102": "mdi:gesture-tap-button",   // Button, 4 keys
  "_0x2103": "mdi:gesture-tap-button",   // Button, 6 keys
  "_0x2108": "mdi:gesture-tap-button",   // Status button, 4 keys 4 leds
  "_0x2111": "mdi:dialpad",              // Code keypad
  "_0x2112": "mdi:shield-alert",         // Tamper circuit
  "_0x2113": "mdi:doorbell",             // Doorbell button
  "_0x2115": "mdi:battery-charging",     // Backup module

  // Dataline - outlets
  "_0x2201": "mdi:power-socket-eu",      // Plug outlet
  "_0x2202": "mdi:ceiling-light",        // Lamp outlet
  "_0x2203": "mdi:bullhorn",             // Sounder, internal

  // Wireless - buttons
  "_0x4102": "mdi:remote",               // Button, 4 keys
  "_0x4103": "mdi:remote",               // Button, 6 keys

  // Wireless - relays
  "_0x4201": "mdi:power-socket-eu",      // Plug outlet
  "_0x4202": "mdi:ceiling-light",        // Lamp outlet relay
  "_0x4203": "mdi:electric-switch",      // Universal relay
  "_0x4204": "mdi:power-plug",           // Mobile relay
  "_0x4403": "mdi:light-switch",         // Combi relay, 2 buttons
  "_0x4404": "mdi:light-switch",         // Combi relay, 4 buttons

  // Wireless - dimmers
  "_0x4301": "mdi:lightbulb-on-50",      // Dimmer, mobile
  "_0x4302": "mdi:lightbulb-on-50",      // Dimmer, lamp outlet
  "_0x4303": "mdi:lightbulb-on-50",      // Dimmer, mobile
  "_0x4304": "mdi:lightbulb-on-50",      // Dimmer, lamp outlet
  "_0x4305": "mdi:lightbulb-on-50",      // Dimmer, blind
  "_0x4306": "mdi:lightbulb-on-50",      // Dimmer, universal
  "_0x4307": "mdi:lightbulb-on-50",      // Dimmer, 3 wire puck 1 button
  "_0x4308": "mdi:lightbulb-on-50",      // Dimmer, 3 wire puck 2 buttons
  "_0x4401": "mdi:lightbulb-on-50",      // Combi dimmer, 2 buttons touch
  "_0x4402": "mdi:lightbulb-on-50",      // Combi dimmer, 4 buttons touch
  "_0x4406": "mdi:lightbulb-on-50",      // Combi dimmer, 4 buttons
  "_0x4410": "mdi:lightbulb-on-50",      // Rs485 led dimmer channel
};

// Every product in the project also carries ihc's own icon number, and that
// number groups the products into a handful of kinds. That makes it a complete
// fallback: a product type nobody has seen before still has an icon number, so
// it still gets an icon rather than a question mark.
//
// What the numbers mean is not documented anywhere - these five are read off
// real projects. An unknown one falls through to the chip.
const BY_IHC_ICON: { [icon: string]: string } = {
  "_0x83": "mdi:motion-sensor",      // sensors
  "_0x84": "mdi:bullhorn",           // sounders
  "_0x85": "mdi:gesture-tap-button", // buttons and keypads
  "_0x86": "mdi:ceiling-light",      // light outlets
  "_0x88": "mdi:power-socket-eu",    // power sockets
};

// A room is whatever the installer named it, in whatever language, so there is
// nothing in the project to read an icon from and nothing sensible to guess
// from either. A room therefore looks like what it is - a folder - until
// someone picks an icon for it.
export const GROUP_ICON = "mdi:folder";

export function productIcon(product: IHCProduct): string {
  return BY_PRODUCT[product.ProductIdentifier]
    || BY_IHC_ICON[product.IhcIcon]
    || "mdi:chip";
}

// Whether this product type has an icon of its own rather than the general one
// for its ihc icon number. The properties pane says so, so a type that is not
// in the table can be seen and reported instead of quietly being a grey chip.
export function hasProductIcon(product: IHCProduct): boolean {
  return product.ProductIdentifier in BY_PRODUCT;
}

// The icon someone has picked for this room, or the folder. The chosen icons
// are kept by the ihcviewer integration, one per room, so the same rooms look
// the same on every phone and every browser.
export function groupIcon(group: IHCGroup, chosen?: { [id: string]: string }): string {
  return chosen?.[group.Id] || GROUP_ICON;
}

export const FUNCTIONBLOCK_ICON = "mdi:function-variant";
export const INPUT_ICON = "mdi:arrow-right-bold";
export const OUTPUT_ICON = "mdi:arrow-left-bold";
