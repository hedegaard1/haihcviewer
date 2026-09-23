"""Statisk server til forhaandsvisningen - uden cache.

python -m http.server saetter ingen Cache-Control, og browseren gaetter saa selv
hvor laenge en fil holder. Det gjorde at et genbygget element-tree.js blev ved
med at komme fra cachen, mens resten var nyt - praecis den samme faelde som paa
Home Assistant. Her er svaret no-store, saa hver genindlaesning henter alt.

no-store er ikke nok til ES-moduler. Browseren holder fast i det modul den
allerede har hentet for en given URL, ogsaa efter en haard genindlaesning, og
saa koerte forhaandsvisningen videre paa en gammel udgave af et enkelt element
mens resten var nyt - en klasse med engelske tekster i, selvom filen paa disken
var oversat. Derfor sluger serveren et forled som /v1758537600/ og serverer
resten som normalt: index.html henter panel.js gennem et nyt forled hver gang,
og fordi webpack slaar sine egne stykker op i forhold til panel.js' egen URL,
foelger de med af sig selv. Nye URL'er, nye moduler.
"""
import http.server
import re
import sys

MAPPE = sys.argv[2] if len(sys.argv) > 2 else "."
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8777


VERSIONSFORLED = re.compile(r"^/v\d+/")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=MAPPE, **kwargs)

    def translate_path(self, path):
        return super().translate_path(VERSIONSFORLED.sub("/", path))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    print(f"forhaandsvisning paa http://localhost:{PORT}/preview/ fra {MAPPE}")
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
