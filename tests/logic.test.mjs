// Tests for src/logic.ts - the parts of the panel that are pure logic.
//
//   npm test
//
// Runs on Node's own test runner, with nothing to install: Node 22.6 and later
// read a .ts file directly by stripping the types, and logic.ts has nothing in
// it but types to strip. The Lit elements cannot be tested this way - they
// need a browser - which is why the logic was taken out of them.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  entityMentioned,
  filterGroups,
  isEntityId,
  keepProject,
  platformOf,
  resourceMatches,
  revisionOf,
  slugify,
  suggestName,
  suggestPlatform,
  usedBy,
} from "../src/logic.ts";

describe("revisionOf", () => {
  test("joins the three fields the controller reports", () => {
    assert.equal(revisionOf({
      projectMajorRevision: 123456789, projectMinorRevision: 12,
      lastmodified: "2025-10-14T00:22:00",
    }), "123456789.12.2025-10-14T00:22:00");
  });

  test("a controller that reports none of them gives an empty revision", () => {
    // Not "undefined.undefined.undefined", which is the same every time and
    // would pass for an unchanged project
    assert.equal(revisionOf({}), "");
    assert.equal(revisionOf({ something: "else" }), "");
  });
});

describe("keepProject", () => {
  test("keeps the project while the controller runs the same one", () => {
    assert.equal(keepProject(true, "1.2.x", "1.2.x"), true);
  });

  test("reads it again when the controller runs a new one", () => {
    assert.equal(keepProject(true, "1.2.x", "1.3.y"), false);
  });

  test("reads it when nothing is held", () => {
    assert.equal(keepProject(false, null, "1.2.x"), false);
    assert.equal(keepProject(false, null, null), false);
  });

  test("keeps it when the controller could not be asked", () => {
    assert.equal(keepProject(true, "1.2.x", null), true);
  });

  test("reads it every time when the controller reports no revision", () => {
    assert.equal(keepProject(true, "", ""), false);
  });
});

describe("suggestPlatform", () => {
  const product = (ProductIdentifier, IhcIcon = "") => ({ ProductIdentifier, IhcIcon });

  test("an output on a lamp outlet or a dimmer is a light", () => {
    assert.equal(suggestPlatform("bool", false, product("_0x2202"), false), "light");
    assert.equal(suggestPlatform("bool", false, product("_0x4302"), false), "light");
    assert.equal(suggestPlatform("bool", false, product("_0x4403"), false), "light");
  });

  test("an output on a socket, a relay or a sounder is a switch", () => {
    for (const id of ["_0x2201", "_0x4201", "_0x4203", "_0x4204", "_0x2203"]) {
      assert.equal(suggestPlatform("bool", false, product(id), false), "switch", id);
    }
  });

  test("a product type not in the table goes by its ihc icon number", () => {
    assert.equal(suggestPlatform("bool", false, product("_0x9999", "_0x86"), false), "light");
    assert.equal(suggestPlatform("bool", false, product("_0x9999", "_0x88"), false), "switch");
    assert.equal(suggestPlatform("bool", false, product("_0x9999", "_0x84"), false), "switch");
  });

  test("an input on a product is read: a binary sensor, or a sensor for a number", () => {
    assert.equal(suggestPlatform("bool", false, product("_0x2102"), true), "binary_sensor");
    assert.equal(suggestPlatform("bool", false, product("_0x210e"), true), "binary_sensor");
    assert.equal(suggestPlatform("float", false, product("_0x2124"), true), "sensor");
    assert.equal(suggestPlatform("int", false, product("_0x2136"), true), "sensor");
  });

  test("a light level is a light, product or not", () => {
    assert.equal(suggestPlatform("int", true, null, true), "light");
    assert.equal(suggestPlatform("int", true, product("_0x4302"), false), "light");
  });

  test("nothing is guessed when nothing is known", () => {
    // A function block has no product, and an unknown product type with an
    // unknown icon number says nothing either
    assert.equal(suggestPlatform("bool", false, null, false), "");
    assert.equal(suggestPlatform("bool", false, null, true), "");
    assert.equal(suggestPlatform("bool", false, product("_0x9999", "_0x99"), false), "");
  });

  test("the leds on a button are not taken for a button", () => {
    // An output on a status button lights one of its leds - neither a light
    // nor a switch is the obvious answer, so there is no suggestion
    assert.equal(suggestPlatform("bool", false, product("_0x2108", "_0x85"), false), "");
  });
});

describe("usedBy", () => {
  // The shape search/related answers in: kind -> ids
  const related = {
    label: ["ihc"],
    device: ["abc123"],
    area: ["living_room"],
    config_entry: ["01JXQD56T084FMY429W5A9A0E3"],
    integration: ["ihc"],
    scene: ["scene.aften"],
    automation: ["automation.lys_ude", "automation.alarm"],
    script: [],
  };

  test("keeps what stops working, in a fixed order, sorted", () => {
    assert.deepEqual(usedBy(related), [
      ["automation", ["automation.alarm", "automation.lys_ude"]],
      ["scene", ["scene.aften"]],
    ]);
  });

  test("leaves out what goes with the entity rather than using it", () => {
    // Its device, area, labels and integration are not broken by it going
    const kinds = usedBy(related).map(([kind]) => kind);
    for (const kind of ["label", "device", "area", "config_entry", "integration"]) {
      assert.ok(!kinds.includes(kind), kind);
    }
  });

  test("nothing, or no answer, is an empty list", () => {
    assert.deepEqual(usedBy({}), []);
    assert.deepEqual(usedBy(null), []);
  });
});

describe("entityMentioned", () => {
  const config = {
    views: [{
      cards: [
        { type: "entities", entities: ["light.kitchen"] },
        { type: "vertical-stack", cards: [{ type: "tile", entity: "binary_sensor.stue" }] },
        { type: "markdown", content: "{{ states('sensor.temp') }}" },
        { type: "conditional",
          conditions: [{ condition: "state", entity: "switch.siren", state: "on" }] },
      ],
    }],
  };

  test("finds it wherever it stands in the dashboard", () => {
    for (const id of ["light.kitchen", "binary_sensor.stue", "sensor.temp", "switch.siren"]) {
      assert.equal(entityMentioned(config, id), true, id);
    }
  });

  test("only the whole id", () => {
    // binary_sensor.stue is in there, but neither of these is
    assert.equal(entityMentioned(config, "binary_sensor.stu"), false);
    assert.equal(entityMentioned(config, "sensor.stue"), false);
    assert.equal(entityMentioned({ entity: "light.kitchen_2" }, "light.kitchen"), false);
  });

  test("a template reaching into its state counts", () => {
    assert.equal(entityMentioned("{{ states.light.kitchen.state }}", "light.kitchen"), true);
  });

  test("the dot is a dot, not any letter", () => {
    assert.equal(entityMentioned({ entity: "lightxkitchen" }, "light.kitchen"), false);
  });

  test("an empty dashboard names nothing", () => {
    assert.equal(entityMentioned(null, "light.kitchen"), false);
    assert.equal(entityMentioned({}, "light.kitchen"), false);
  });
});

describe("isEntityId", () => {
  test("knows an entity id", () => {
    assert.equal(isEntityId("binary_sensor.patio_br"), true);
    assert.equal(isEntityId("light.ceiling_ihc_spots_kitchen_9406301"), true);
  });

  // What the mapping holds between adding a resource and the entity being
  // made - shown once as the entity id, with a pencil beside it
  test("does not take the placeholder for one", () => {
    assert.equal(isEntityId("not created yet. Reload the ihc integration."), false);
  });

  test("does not take anything else for one", () => {
    for (const value of ["", null, undefined, "light", "light.", ".x", "Light.X", "light.a b"]) {
      assert.equal(isEntityId(value), false, `${value}`);
    }
  });
});

describe("platformOf", () => {
  test("gives the platform for the four ihc platforms", () => {
    assert.equal(platformOf("binary_sensor.door"), "binary_sensor");
    assert.equal(platformOf("light.kitchen"), "light");
    assert.equal(platformOf("sensor.temperature"), "sensor");
    assert.equal(platformOf("switch.siren"), "switch");
  });

  test("gives nothing for any other domain", () => {
    assert.equal(platformOf("cover.garage"), "");
    assert.equal(platformOf("event.button"), "");
  });

  test("gives nothing for no entity at all", () => {
    assert.equal(platformOf(""), "");
    assert.equal(platformOf(undefined), "");
    assert.equal(platformOf(null), "");
  });

  // The mapping holds a placeholder between adding a resource and reloading
  // the integration, and it must not be read as a platform
  test("gives nothing for the placeholder in the mapping", () => {
    assert.equal(platformOf("Will be removed after HA restart."), "");
  });
});

describe("slugify", () => {
  // Every expected value here is what Home Assistant's own slugify gave for
  // the same name - read with the template {{ name | slugify }} on a running
  // Home Assistant 2026.9.3. The panel has to agree with it, because the entity
  // id it shows is a promise about the one Home Assistant will make.
  const fromHomeAssistant = [
    ["Køkken tryk øverst venstre", "kokken_tryk_overst_venstre"],
    ["Tryk 4 tast (Bedroom) (øverst venstre)", "tryk_4_tast_bedroom_overst_venstre"],
    ["4-Button Switch - Patio door (BR) (Living room)", "4_button_switch_patio_door_br_living_room"],
    ["Ærø Færge", "aero_faerge"],
    ["Straße", "strasse"],
    ["Café Åbo", "cafe_abo"],
    ["Blåbærgrød", "blabaergrod"],
    ["  --Hej  med  dig--  ", "hej_med_dig"],
    ["Łódź", "lodz"],
    ["Þór og Đuro", "thor_og_duro"],
    ["100% lys", "100_lys"],
    ["Tryk 4 tast (Kitchen) (Tryk 1)", "tryk_4_tast_kitchen_tryk_1"],
    ["Stikkontakt (Bedroom) (Udgang)", "stikkontakt_bedroom_udgang"],
    ["æøåÆØÅ", "aeoaaeoa"],
    ["naïve résumé", "naive_resume"],
  ];

  for (const [name, expected] of fromHomeAssistant) {
    test(`"${name}" -> ${expected}`, () => {
      assert.equal(slugify(name), expected);
    });
  }

  test("gives an empty string for no name", () => {
    assert.equal(slugify(""), "");
    assert.equal(slugify(undefined), "");
    assert.equal(slugify(null), "");
    assert.equal(slugify("   "), "");
  });

  // The accents are removed by character number, not by a pattern, because a
  // pattern of combining marks was minified into invisible characters that did
  // not survive being written to Home Assistant
  test("leaves no combining marks behind", () => {
    const slug = slugify("àáâãäåèéêëìíîïòóôõöùúûüýÿ");
    assert.match(slug, /^[a-z]+$/);
  });
});

describe("suggestName", () => {
  const room = { Name: "Bedroom" };
  const product = { Name: "Tryk 4 tast" };

  test("is the heading, the room and the parenthesis", () => {
    const resource = { Name: "Tryk (øverst venstre)", Parent: product, Group: room };
    assert.equal(suggestName(resource), "Tryk 4 tast (Bedroom) (øverst venstre)");
  });

  test("takes the whole name when there is no parenthesis", () => {
    const resource = { Name: "Udgang", Parent: { Name: "Stikkontakt" }, Group: room };
    assert.equal(suggestName(resource), "Stikkontakt (Bedroom) (Udgang)");
  });

  test("takes only the last parenthesis", () => {
    const resource = { Name: "Tryk (a) (b)", Parent: product, Group: room };
    assert.equal(suggestName(resource), "Tryk 4 tast (Bedroom) (b)");
  });

  test("allows space after the parenthesis", () => {
    const resource = { Name: "Tryk (nederst højre)  ", Parent: product, Group: room };
    assert.equal(suggestName(resource), "Tryk 4 tast (Bedroom) (nederst højre)");
  });

  test("falls back on the product when there is no parent", () => {
    const resource = { Name: "Tryk (x)", Product: product, Group: room };
    assert.equal(suggestName(resource), "Tryk 4 tast (Bedroom) (x)");
  });

  test("uses a function block as the heading", () => {
    const resource = { Name: "Tænd", Parent: { Name: "1.1.01. Kip blok" }, Group: room };
    assert.equal(suggestName(resource), "1.1.01. Kip blok (Bedroom) (Tænd)");
  });

  test("leaves out what it does not have", () => {
    assert.equal(suggestName({ Name: "Tryk (x)", Parent: product }), "Tryk 4 tast (x)");
    assert.equal(suggestName({ Name: "Tryk (x)", Group: room }), "(Bedroom) (x)");
    assert.equal(suggestName({ Name: "", Parent: product, Group: room }), "Tryk 4 tast (Bedroom)");
  });

  test("gives an empty string for nothing selected", () => {
    assert.equal(suggestName(undefined), "");
    assert.equal(suggestName(null), "");
  });

  // Not the product's position, even where it happens to end in the room -
  // the position is free text and promises nothing
  test("ignores the product's position", () => {
    const resource = {
      Name: "Tryk (x)",
      Parent: { Name: "Tryk 4 tast", Position: "4-Button Switch - Bed (Bedroom)" },
      Group: { Name: "Soveværelse" },
    };
    assert.equal(suggestName(resource), "Tryk 4 tast (Soveværelse) (x)");
  });
});

describe("resourceMatches", () => {
  const product = { Name: "Tryk 4 tast", Position: "4-Button Switch - Walk-in door", Note: "Tryk med 4 SL" };
  const resource = {
    Name: "Tryk (øverst venstre)",
    Id: 26714,
    entity_id: "binary_sensor.walk_in_tl",
    friendlyName: "Walk-in øverst venstre",
  };

  test("matches everything on an empty search", () => {
    assert.equal(resourceMatches(resource, product, ""), true);
  });

  test("looks in the resource's own name, id, entity id and friendly name", () => {
    assert.equal(resourceMatches(resource, product, "øverst"), true);
    assert.equal(resourceMatches(resource, product, "2671"), true);
    assert.equal(resourceMatches(resource, product, "binary_sensor.walk"), true);
    assert.equal(resourceMatches(resource, product, "walk-in øverst"), true);
  });

  test("looks in the product it sits on", () => {
    assert.equal(resourceMatches(resource, product, "tryk 4"), true);
    assert.equal(resourceMatches(resource, product, "walk-in door"), true);
    assert.equal(resourceMatches(resource, product, "4 sl"), true);
  });

  test("is case-insensitive in what it searches", () => {
    assert.equal(resourceMatches(resource, product, "walk-in door"), true);
  });

  test("finds nothing that is not there", () => {
    assert.equal(resourceMatches(resource, product, "kitchen"), false);
    assert.equal(resourceMatches(resource, product, "99999"), false);
  });

  test("copes with a resource that is not in Home Assistant", () => {
    const bare = { Name: "Tryk", Id: 1 };
    assert.equal(resourceMatches(bare, undefined, "tryk"), true);
    assert.equal(resourceMatches(bare, undefined, "light"), false);
  });
});

describe("filterGroups", () => {
  // Bedroom as it stands in a real project: two four-button switches, a
  // socket and two function blocks. The room also appears at the end of every
  // product's position, the way IHC Visual writes it.
  function bedroom() {
    const product = (Name, Position, ids) => ({
      Name, Position, Note: "",
      Children: ids.map((Id) => ({ Id, Name: "Tryk", entity_id: "", friendlyName: "" })),
    });
    const children = [
      product("Tryk 4 tast", "4-Button Switch - Living room door (Bedroom)", [26458, 26714, 26970, 27226]),
      product("Tryk 4 tast", "4-Button Switch - Bed (Bedroom)", [27738, 27994, 28250, 28506]),
      product("Stikkontakt", "Power Outlet - Walls (Bedroom)", [29787]),
      product("1.1.01. Kip blok", "", [1050129]),
      product("4.1.15. Kort-lang tryk", "", [7390225]),
    ];
    return { Name: "Bedroom", Children: children };
  }
  function kitchen() {
    return {
      Name: "Kitchen",
      Children: [{ Name: "Lampeudtag", Position: "Light outlet (Kitchen)", Note: "",
        Children: [{ Id: 40001, Name: "Udgang", entity_id: "", friendlyName: "" }] }],
    };
  }
  const ids = (node) => (node.filtered || []).map((r) => r.Id);

  test("an id narrows the tree to that one resource", () => {
    const groups = [bedroom(), kitchen()];
    const hits = filterGroups(groups, "2671", "");
    assert.equal(hits, 1);
    assert.equal(groups[0].filtered.length, 1);
    assert.deepEqual(ids(groups[0].filtered[0]), [26714]);
    assert.deepEqual(groups[1].filtered, []);
  });

  test("the product type keeps only that product", () => {
    const groups = [bedroom(), kitchen()];
    const hits = filterGroups(groups, "", "Stikkontakt");
    assert.equal(hits, 1);
    assert.deepEqual(groups[0].filtered.map((c) => c.Name), ["Stikkontakt"]);
    assert.deepEqual(groups[1].filtered, []);
  });

  test("text and product type work together", () => {
    const groups = [bedroom()];
    assert.equal(filterGroups(groups, "bed", "Stikkontakt"), 1);
    assert.equal(filterGroups(groups, "2671", "Stikkontakt"), 0);
  });

  test("a room whose own name matches shows everything in it", () => {
    const groups = [bedroom(), kitchen()];
    assert.equal(filterGroups(groups, "bedroom", ""), 11);
    assert.equal(groups[0].filtered.length, 5);
  });

  // The documented cost of searching the product: the position ends in the
  // room, so a short word from the room name brings the whole room along
  test("a word from the room name brings the room along", () => {
    assert.equal(filterGroups([bedroom()], "bed", ""), 11);
  });

  test("text is trimmed and not case-sensitive", () => {
    const groups = [bedroom()];
    assert.equal(filterGroups(groups, "  STIKKONTAKT ", ""), 1);
  });

  test("no filter sets everything back to null", () => {
    const groups = [bedroom(), kitchen()];
    filterGroups(groups, "2671", "");
    const hits = filterGroups(groups, "", "");
    assert.equal(hits, 0);
    for (const group of groups) {
      assert.equal(group.filtered, null);
      for (const child of group.Children) assert.equal(child.filtered, null);
    }
  });

  test("nothing found leaves every room empty, not unfiltered", () => {
    const groups = [bedroom(), kitchen()];
    assert.equal(filterGroups(groups, "no such thing", ""), 0);
    assert.deepEqual(groups[0].filtered, []);
    assert.deepEqual(groups[1].filtered, []);
  });

  // The selection goes into the objects it is given. That is the contract the
  // controller relies on - and the reason it has to ask the tree to redraw:
  // the objects are the same, so Lit sees no change by itself.
  test("writes into the same objects it is given", () => {
    const groups = [bedroom()];
    const product = groups[0].Children[0];
    filterGroups(groups, "2671", "");
    assert.equal(groups[0].filtered[0], product);
    assert.equal(product.filtered[0], product.Children[1]);
  });

  test("copes with an empty project", () => {
    assert.equal(filterGroups([], "anything", ""), 0);
  });
});
