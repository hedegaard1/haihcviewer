"""Static server for the preview - without a cache.

    npm run buildprod
    python preview/server.py            (then open http://localhost:8777/preview/)

The preview runs the built panel in a plain browser, against stand-ins for Home
Assistant and the api in index.html and the made-up project in project.xml
(written by make_project.py).

python -m http.server sets no Cache-Control, and the browser then guesses by
itself how long a file keeps. That made a rebuilt element-tree.js keep coming
from the cache while the rest was new - the very same trap as on Home
Assistant. Here the answer is no-store, so every reload fetches everything.

no-store is not enough for ES modules. The browser holds on to a module it has
already fetched for a given url, even across a hard reload, and then the
preview ran on an old version of a single element while the rest was new - a
class with English texts in it, although the file on disk was translated. So
the server swallows a prefix like /v1758537600/ and serves the rest as usual:
index.html fetches panel.js through a new prefix every time, and because
webpack looks up its own chunks relative to panel.js' own url, they follow by
themselves. New urls, new modules.
"""
import http.server
import re
import sys

FOLDER = sys.argv[2] if len(sys.argv) > 2 else "."
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8777


VERSION_PREFIX = re.compile(r"^/v\d+/")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FOLDER, **kwargs)

    def translate_path(self, path):
        return super().translate_path(VERSION_PREFIX.sub("/", path))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    print(f"preview on http://localhost:{PORT}/preview/ from {FOLDER}")
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
