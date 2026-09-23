"""Writes preview/project.xml - a made-up IHC project for the preview.

It is on purpose NOT a real project. A real .vis carries the customer's name and
address in customer_info, and that does not belong in a repository that gets
passed on. Instead there is one of each product type, so every icon can be seen
at once.
"""
import pathlib

# (product_identifier, ihc icon, name, inputs, outputs) - the types of a real installation
TYPES = [
    ("_0x2102", "_0x85", "LK FUGA Tryk 4 tast", 4, 0),
    ("_0x2103", "_0x85", "LK FUGA Tryk 6 tast", 6, 0),
    ("_0x2108", "_0x85", "LK FUGA Statustryk 4 tast 4 dioder", 4, 4),
    ("_0x2109", "_0x83", "Magnetkontaktsaet", 1, 0),
    ("_0x210e", "_0x83", "PIR", 1, 0),
    ("_0x210f", "_0x83", "PIR alarm", 1, 0),
    ("_0x2110", "_0x83", "Skumringsrelae", 1, 0),
    ("_0x2111", "_0x85", "Kodetastatur", 2, 1),
    ("_0x2112", "_0x83", "Sabotagekreds", 1, 0),
    ("_0x2113", "_0x85", "Ringetryk", 1, 0),
    ("_0x2115", "_0x83", "Backup modul", 1, 0),
    ("_0x2201", "_0x88", "Stikkontakt", 0, 1),
    ("_0x2202", "_0x86", "Lampeudtag", 0, 1),
    ("_0x2203", "_0x84", "Lydgiver intern", 0, 1),
    ("_0x4304", "_0x86", "Lampeudtag dimmer", 0, 1),
    # Does not exist - it is here to show what an unknown product type looks
    # like: the icon comes from the ihc icon number, and the properties pane
    # says so.
    ("_0x9999", "_0x85", "Ukendt produkttype", 1, 0),
]
WIRELESS = [
    ("_0x4102", "_0x85", "Tryk 4 tast", 4, 0),
    ("_0x4103", "_0x85", "Tryk 6 tast", 6, 0),
]
ROOMS = ["Kitchen", "Living room", "Bedroom", "Hallway", "Outdoor"]

next_id = 0x1000


def new_id():
    global next_id
    next_id += 3
    return f"_0x{next_id:x}"


def product(tag, pid, icon, name, inputs, outputs, room):
    lines = [
        f'    <{tag} id="{new_id()}" product_identifier="{pid}" icon="{icon}"'
        f' name="{name}" note="Note for {name.lower()}"'
        f' position="{name} ({room})" cablenumber="{next_id % 40}">'
    ]
    input_tag = "airlink_input" if tag == "product_airlink" else "dataline_input"
    output_tag = "airlink_relay" if tag == "product_airlink" else "dataline_output"
    for i in range(inputs):
        lines.append(f'      <{input_tag} id="{new_id()}" name="Tryk {i + 1}"/>')
    for i in range(outputs):
        lines.append(f'      <{output_tag} id="{new_id()}" name="Udgang"/>')
    lines.append(f"    </{tag}>")
    return lines


out = ['<?xml version="1.0" encoding="UTF-8"?>', "<utcs_project>", "  <groups>"]
for number, room in enumerate(ROOMS):
    out.append(f'  <group id="{new_id()}" name="{room}" note="Gruppe {number + 1}">')
    for pid, icon, name, ins, outs in TYPES[number::len(ROOMS)]:
        out += product("product_dataline", pid, icon, name, ins, outs, room)
    for pid, icon, name, ins, outs in WIRELESS[number::len(ROOMS)]:
        out += product("product_airlink", pid, icon, name, ins, outs, room)
    out.append(f'    <functionblock id="{new_id()}" name="1.1.01. Kip blok"'
               ' note="Generel funktionsblok">')
    out.append("      <inputs>")
    for name in ("KIP", "Taend", "Sluk"):
        out.append(f'        <resource_input id="{new_id()}" name="{name}"/>')
    out.append("      </inputs>")
    out.append("      <outputs>")
    for name in ("Udgang for lys", "ON puls"):
        out.append(f'        <resource_output id="{new_id()}" name="{name}"/>')
    out.append("      </outputs>")
    out.append("    </functionblock>")
    out.append("  </group>")
out += ["  </groups>", "</utcs_project>", ""]

path = pathlib.Path(__file__).with_name("project.xml")
path.write_text("\n".join(out), encoding="utf-8")
print(f"wrote {path} ({path.stat().st_size} bytes)")
