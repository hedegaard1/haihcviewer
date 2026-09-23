"""Skriver preview/project.xml - et opdigtet IHC-projekt til forhaandsvisningen.

Det er MED VILJE ikke et rigtigt projekt. En rigtig .vis baerer kundens navn og
adresse i customer_info, og den slags skal ikke ligge i et repo der en dag bliver
sendt videre. Her er der i stedet én af hver produkttype, saa alle ikoner kan ses
paa én gang.
"""
import pathlib

# (product_identifier, ihc-ikon, navn) - taget fra et rigtigt anlaegs typer
TYPER = [
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
    # Findes ikke - den er her for at vise hvordan en ukendt produkttype ser ud:
    # ikonet kommer fra ihc-ikonnummeret, og egenskabsmenuen siger det.
    ("_0x9999", "_0x85", "Ukendt produkttype", 1, 0),
]
TRAADLOES = [
    ("_0x4102", "_0x85", "Tryk 4 tast", 4, 0),
    ("_0x4103", "_0x85", "Tryk 6 tast", 6, 0),
]
RUM = ["Kitchen", "Living room", "Bedroom", "Hallway", "Outdoor"]

naeste = 0x1000


def nyt_id():
    global naeste
    naeste += 3
    return f"_0x{naeste:x}"


def produkt(tag, pid, ikon, navn, indgange, udgange, rum):
    linjer = [
        f'    <{tag} id="{nyt_id()}" product_identifier="{pid}" icon="{ikon}"'
        f' name="{navn}" note="Note for {navn.lower()}"'
        f' position="{navn} ({rum})" cablenumber="{naeste % 40}">'
    ]
    indtag = "airlink_input" if tag == "product_airlink" else "dataline_input"
    udtag = "airlink_relay" if tag == "product_airlink" else "dataline_output"
    for i in range(indgange):
        linjer.append(f'      <{indtag} id="{nyt_id()}" name="Tryk {i + 1}"/>')
    for i in range(udgange):
        linjer.append(f'      <{udtag} id="{nyt_id()}" name="Udgang"/>')
    linjer.append(f"    </{tag}>")
    return linjer


ud = ['<?xml version="1.0" encoding="UTF-8"?>', "<utcs_project>", "  <groups>"]
for nr, rum in enumerate(RUM):
    ud.append(f'  <group id="{nyt_id()}" name="{rum}" note="Gruppe {nr + 1}">')
    for pid, ikon, navn, ind, udg in TYPER[nr::len(RUM)]:
        ud += produkt("product_dataline", pid, ikon, navn, ind, udg, rum)
    for pid, ikon, navn, ind, udg in TRAADLOES[nr::len(RUM)]:
        ud += produkt("product_airlink", pid, ikon, navn, ind, udg, rum)
    ud.append(f'    <functionblock id="{nyt_id()}" name="1.1.01. Kip blok"'
              ' note="Generel funktionsblok">')
    ud.append("      <inputs>")
    for navn in ("KIP", "Taend", "Sluk"):
        ud.append(f'        <resource_input id="{nyt_id()}" name="{navn}"/>')
    ud.append("      </inputs>")
    ud.append("      <outputs>")
    for navn in ("Udgang for lys", "ON puls"):
        ud.append(f'        <resource_output id="{nyt_id()}" name="{navn}"/>')
    ud.append("      </outputs>")
    ud.append("    </functionblock>")
    ud.append("  </group>")
ud += ["  </groups>", "</utcs_project>", ""]

sti = pathlib.Path(__file__).with_name("project.xml")
sti.write_text("\n".join(ud), encoding="utf-8")
print(f"skrevet {sti} ({sti.stat().st_size} byte)")
