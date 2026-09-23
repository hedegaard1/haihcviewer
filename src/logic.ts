// The parts of the panel that are pure logic: they take data and hand data
// back, and touch neither the page nor Home Assistant. They live here, apart
// from the Lit elements, so they can be tested without a browser - an element
// cannot even be loaded outside one. The tests are in tests/logic.test.mjs.

const PLATFORMS = ["binary_sensor", "light", "sensor", "switch"];

// A name like "Tryk (oeverst venstre)": what is in the last parenthesis
const PARENTHESIS = /\(([^)]*)\)\s*$/;

// Which of the four ihc platforms an entity belongs to, read off the domain in
// its id. Anything that is not one of them is not an answer: the panel writes a
// placeholder into the mapping between adding a resource and reloading the
// integration, and that placeholder has a dot in it too. So it is "".
export function platformOf(entity_id): string {
  const domain = `${entity_id}`.split(".")[0];
  return PLATFORMS.includes(domain) ? domain : "";
}

// Whether a value is an entity id at all. Between adding a resource and the ihc
// integration making the entity, the mapping holds a placeholder - an English
// sentence, with a dot in it - and that must not be shown as the entity id,
// with a pencil beside it to rename something that does not exist yet.
export function isEntityId(value): boolean {
  return /^[a-z0-9_]+\.[a-z0-9_]+$/.test(`${value || ""}`);
}

// The same thing Home Assistant does to a name to make an entity id out of
// it: the accented letters written out, everything else that is not a letter
// or a digit turned into an underscore, and no underscore at either end.
export function slugify(name: string): string {
  const written: { [letter: string]: string } = {
    "æ": "ae", "ø": "o", "ß": "ss", "đ": "d", "ð": "d",
    "þ": "th", "ł": "l",
  };
  return `${name || ""}`
    .toLowerCase()
    .replace(/[æøßđðþł]/g, (letter) => written[letter])
    // Splits the accented letters into a plain letter and its accent, so the
    // accent can be dropped and the letter kept - a becomes a, not nothing.
    // The accents are dropped by their character number rather than by a
    // pattern: they are marks with no shape of their own, and written into a
    // pattern they are invisible in the file they end up in.
    .normalize("NFD")
    .split("")
    .filter((letter) => {
      const code = letter.charCodeAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join("")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// What to call the entity: the three rows of the tree read downwards, so
// "Tryk 4 tast (Bedroom) (oeverst venstre)" - the switch, the room it hangs
// in, and which of its four buttons this is. On its own the resource says
// only the last of those, and it says it the same way on every switch in
// the house.
//
// The room is taken from the group the resource sits in rather than from
// the product's position. The position is free text out of IHC Visual: in
// one project it happens to end in the room, but that is how that project
// was filled in, not something the format promises.
//
// A name like "Tryk (oeverst venstre)" carries the whole difference in the
// parenthesis, and the word in front of it is the same on every button of
// that switch, so only the parenthesis is kept. A name with no parenthesis
// - an output simply called "Udgang" - has nothing to strip and is taken
// whole, in a parenthesis of its own so the shape stays the same.
export function suggestName(resource): string {
  if (!resource) return "";
  const heading = resource.Parent?.Name || resource.Product?.Name || "";
  const room = resource.Group?.Name || "";
  const name = `${resource.Name || ""}`;
  const inside = name.match(PARENTHESIS);
  const what = inside ? inside[1] : name;
  return [heading, room ? `(${room})` : "", what ? `(${what})` : ""]
    .filter((part) => part).join(" ").trim();
}

// Everything the search looks through for one resource: what the project
// calls it, its ihc id, and - once it is in Home Assistant - the entity id
// and the name shown there. The product is included because that is where
// the words that tell two buttons apart usually sit: a resource called
// "Tryk (oeverst venstre)" is only findable through "Walk-in door".
//
// text is expected trimmed and in lower case already.
export function resourceMatches(resource, product, text: string): boolean {
  if (text === "") return true;
  const haystack = [
    resource.Name, `${resource.Id}`, resource.entity_id, resource.friendlyName,
    product?.Name, product?.Position, product?.Note,
  ];
  return haystack.some((part) => `${part || ""}`.toLowerCase().includes(text));
}

// Works out what the search and the product type leave in the tree, and writes
// it into the tree itself: `filtered` on each room and on each product. A node
// shows `filtered` when it is set and all its children when it is null, so
// clearing the filter is setting everything back to null.
//
// Returns the number of resources left. A room whose own name matches the
// text shows everything in it.
//
// The selection is written into the same objects the tree's nodes already
// hold, so the nodes will not draw it by themselves - see openFiltered in the
// controller.
export function filterGroups(groups, text: string, product: string): number {
  const needle = `${text || ""}`.trim().toLowerCase();
  const active = needle !== "" || !!product;
  let hits = 0;
  for (let group of groups) {
    const wholeRoom = needle !== "" && `${group.Name}`.toLowerCase().includes(needle);
    for (let child of group.Children) {
      if (!active) {
        child.filtered = null;
        continue;
      }
      if (product && child.Name !== product) {
        child.filtered = [];
        continue;
      }
      child.filtered = (child.Children || []).filter(
        (resource) => wholeRoom || resourceMatches(resource, child, needle));
      hits += child.filtered.length;
    }
    group.filtered = active
      ? group.Children.filter((child) => (child.filtered || []).length > 0)
      : null;
  }
  return hits;
}

// What an output on each product type most likely is in Home Assistant. The
// identifiers and names are the ones in icons.ts. A type that is not here goes
// by its ihc icon number instead, and one with neither gets no suggestion.
const OUTPUT_PLATFORM: { [identifier: string]: string } = {
  "_0x2201": "switch",   // Plug outlet
  "_0x2202": "light",    // Lamp outlet
  "_0x2203": "switch",   // Sounder, internal
  "_0x4201": "switch",   // Plug outlet
  "_0x4202": "light",    // Lamp outlet relay
  "_0x4203": "switch",   // Universal relay
  "_0x4204": "switch",   // Mobile relay
  "_0x4403": "light",    // Combi relay, 2 buttons
  "_0x4404": "light",    // Combi relay, 4 buttons
  "_0x4301": "light",    // Dimmer, mobile
  "_0x4302": "light",    // Dimmer, lamp outlet
  "_0x4303": "light",    // Dimmer, mobile
  "_0x4304": "light",    // Dimmer, lamp outlet
  "_0x4305": "light",    // Dimmer, blind
  "_0x4306": "light",    // Dimmer, universal
  "_0x4307": "light",    // Dimmer, 3 wire puck 1 button
  "_0x4308": "light",    // Dimmer, 3 wire puck 2 buttons
  "_0x4401": "light",    // Combi dimmer, 2 buttons touch
  "_0x4402": "light",    // Combi dimmer, 4 buttons touch
  "_0x4406": "light",    // Combi dimmer, 4 buttons
  "_0x4410": "light",    // Rs485 led dimmer channel
};

// The ihc icon numbers that are outputs - sounders, light outlets and sockets.
// The sensor and button numbers are left out on purpose: an output on a
// button is one of its leds, and neither a light nor a switch is the answer.
const OUTPUT_PLATFORM_BY_IHC_ICON: { [icon: string]: string } = {
  "_0x84": "switch",
  "_0x86": "light",
  "_0x88": "switch",
};

// Which platform the panel should show first for a resource, or "" when there
// is nothing to go on. The panel still offers every platform the type allows;
// this only picks the one that fits the thing the resource sits on.
//
// A light level is a light wherever it is. An input on a product is read -
// a binary sensor, or a sensor for a number. An output goes by the product
// type. A resource in a function block has no product, so it gets no guess.
export function suggestPlatform(type: string, isLightLevel: boolean, product, isInput: boolean): string {
  if (isLightLevel) return "light";
  if (!product) return "";
  if (isInput) return type === "bool" ? "binary_sensor" : "sensor";
  return OUTPUT_PLATFORM[product.ProductIdentifier]
    || OUTPUT_PLATFORM_BY_IHC_ICON[product.IhcIcon]
    || "";
}

// What stops working when an entity goes, in the order the remove dialog lists
// it. These are the kinds Home Assistant's search/related reports as using an
// entity. It also reports the entity's device, area, labels and integration,
// but those are not broken by it going, so they are not listed.
export const USED_BY_KINDS = ["automation", "script", "scene", "group", "person"];

export function usedBy(related): [string, string[]][] {
  return USED_BY_KINDS
    .filter((kind) => (related?.[kind] || []).length > 0)
    .map((kind) => [kind, [...related[kind]].sort()] as [string, string[]]);
}

// Whether a dashboard's config names an entity. Searched as text, so a card
// inside a stack, a condition and a template all count. Only the whole id
// does: binary_sensor.stue is not sensor.stue, and light.kitchen is not
// light.kitchen_2. An entity id has nothing in it but small letters, digits,
// underscores and the dot, so the dot is the only thing to escape.
export function entityMentioned(config, entityId: string): boolean {
  const id = entityId.replace(/\./g, "\\.");
  return new RegExp(`(^|[^a-z0-9_])${id}($|[^a-z0-9_])`)
    .test(JSON.stringify(config ?? ""));
}
