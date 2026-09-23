""" Constants used by ihcviewer."""
NAME_SHORT = "IHCViewer"
DOMAIN = "ihcviewer"
PROJECT_URL = "https://github.com/dingusdk/haihcviewer/"
ISSUE_URL = f"{PROJECT_URL}issues"

CONF_CONTROLLER_ID = "controller_id"

IHC_PLATFORMS = ("binary_sensor", "light", "sensor", "switch")

URL_PANEL = "ihc_viewer"

# The sidebar icon is our own drawing, from the icon set in
# icons/ihcviewer-icons.js, served from this fixed address.
URL_ICONS = "/ihcviewer_icons"
SIDEBAR_ICON = "ihcviewer:logo"

# Where the version from manifest.json is kept. The panel is served from
# /ihcviewer/frontend-<version>/, so the version is what stops a browser from
# using the panel.js it cached before an update. There used to be a VERSION
# constant here as well, and it had drifted to 2.0.6 while the manifest said
# 2026.2.0 - so that url never changed and the cache was never defeated.
DATA_VERSION = f"{DOMAIN}_version"

# Where the url the frontend files are served from is kept. It carries a marker
# for what the files actually are, not just the version - see async_setup.
DATA_FRONTEND = f"{DOMAIN}_frontend"

# Where the project we have read from each controller is kept. It is well over
# a megabyte of xml on a medium sized installation, and the controller is not
# quick about it, so it is read once and then served from here.
DATA_PROJECT = f"{DOMAIN}_project"

# Where the store holding the rooms' icons is kept, and what it is called on
# disk. The icons are a user's choice, not something the project knows, so they
# live in .storage rather than in the configuration folder.
DATA_GROUPICONS = f"{DOMAIN}_groupicons"
STORAGE_VERSION = 1
STORAGE_KEY_GROUPICONS = f"{DOMAIN}.groupicons"
