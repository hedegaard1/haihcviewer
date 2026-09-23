"""
IHC Viever component.

see http://www.dingus.dk for more information
"""

import hashlib
import logging
import os.path

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.frontend import (
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.loader import async_get_integration

from .const import (
    DATA_FRONTEND,
    DATA_PROJECT,
    DATA_VERSION,
    DOMAIN,
    NAME_SHORT,
    URL_PANEL,
)

from .api.entity import ApiEntity
from .api.getresource import ApiGetResource
from .api.groupicons import ApiGroupIcons
from .api.log import ApiLog
from .api.manual_binarysensor import ApiManualBinarySensor
from .api.manual_light import ApiManualLight
from .api.manual_remove import ApiManualRemove
from .api.manual_sensor import ApiManualSensor
from .api.manual_switch import ApiManualSwitch
from .api.mapping import ApiMapping
from .api.project import ApiProject
from .api.projectinfo import ApiProjectInfo
from .api.reload import ApiReload
from .api.setboolresource import ApiSetBoolResource
from .api.systeminfo import ApiSystemInfo


DEPENDENCIES = ["ihc"]

_LOGGER = logging.getLogger(__name__)

MANUAL_SETUP_YAML = "ihc_manual_setup.yaml"


async def async_setup(hass: HomeAssistant, config):
    """Setup the IHC viewer component."""

    if DOMAIN in config and config is not None:
        _LOGGER.error("Setup using configuration is not supported anymore")
        return False

    integration = await async_get_integration(hass, DOMAIN)
    hass.data[DATA_VERSION] = str(integration.version)
    await async_register_frontend(hass)
    hass.http.register_view(ApiEntity(hass))
    hass.http.register_view(ApiGetResource(hass))
    hass.http.register_view(ApiGroupIcons(hass))
    hass.http.register_view(ApiLog(hass))
    hass.http.register_view(ApiManualBinarySensor(hass))
    hass.http.register_view(ApiManualLight(hass))
    hass.http.register_view(ApiManualRemove(hass))
    hass.http.register_view(ApiManualSensor(hass))
    hass.http.register_view(ApiManualSwitch(hass))
    hass.http.register_view(ApiMapping(hass))
    hass.http.register_view(ApiProject(hass))
    hass.http.register_view(ApiProjectInfo(hass))
    hass.http.register_view(ApiReload(hass))
    hass.http.register_view(ApiSetBoolResource(hass))
    hass.http.register_view(ApiSystemInfo(hass))
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the IHC Viewer from a config entry."""

    if "ihc" not in hass.data:
        if "ihc0" in hass.data:
            _LOGGER.error(
                "IHCViewer 2.x does not support the old IHC integration."
                "You must update your IHC integration"
            )
        else:
            _LOGGER.error("IHC integration is not loaded")
        return False
    hass.data.setdefault(DOMAIN, {})
    try:
        hass.data[DOMAIN] = [v["controller_id"] for v in hass.data["ihc"].values()]
    except KeyError:
        _LOGGER.error(
            "IHCViewer does not support the old IHC integration."
            "You must update your IHC integration"
        )
        return False

    add_side_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    async_remove_panel(hass, URL_PANEL)
    hass.data.pop(DOMAIN)
    hass.data.pop(DATA_PROJECT, None)
    return True


def add_side_panel(hass):
    """Add the IHCViewer sidepanel"""

    version = hass.data[DATA_VERSION]
    custom_panel_config = {
        "name": "ha-panel-ihcviewer",
        "embed_iframe": False,
        "trust_external": False,
        "module_url": f"{hass.data[DATA_FRONTEND]}/panel.js",
    }
    panelconf = {}
    panelconf["_panel_custom"] = custom_panel_config
    panelconf["version"] = version
    panelconf[DOMAIN] = hass.data[DOMAIN]
    async_register_built_in_panel(
        hass,
        component_name="custom",
        frontend_url_path=URL_PANEL,
        sidebar_title=NAME_SHORT,
        sidebar_icon="mdi:file-tree",
        config=panelconf,
        require_admin=True,
    )


def frontend_marker(path, filenames):
    """Eight characters that change when the built files do.

    The panel used to be served from /ihcviewer/frontend-<version>/, and a
    browser that had the files would not ask again - they are sent with a
    month of cache and the url only changes when the version in the manifest
    does. Worse, panel.js pulls the other files in as modules after the page
    has loaded, and a hard reload does not reach those, so a rebuilt panel
    could sit unseen behind a cache for weeks. With this in the url the address
    changes as soon as the files do."""
    parts = [
        f"{name}:{os.path.getsize(os.path.join(path, name))}"
        for name in sorted(filenames)
    ]
    return hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()[:8]


async def async_register_frontend(hass):
    """Register frontend static files."""
    version = hass.data[DATA_VERSION]
    path = os.path.join(os.path.dirname(__file__), "frontend")
    dirlist = await hass.async_add_executor_job(os.listdir, path)
    served = [
        filename
        for filename in dirlist
        if os.path.splitext(filename)[1].lower() in (".png", ".html", ".js")
    ]
    marker = await hass.async_add_executor_job(frontend_marker, path, served)
    base = f"/ihcviewer/frontend-{version}-{marker}"
    hass.data[DATA_FRONTEND] = base
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                f"{base}/{filename}",
                os.path.join(path, filename),
                # Not cached: the marker above already gives a new address for
                # new files, and without this a file replaced between restarts
                # would still be served from the browser cache.
                False,
            )
            for filename in served
        ]
    )
