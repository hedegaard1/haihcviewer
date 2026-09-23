"""ApiManualRemove class"""
import logging

from homeassistant.core import callback

from .apibase import ApiBase
from .change import put_into_effect, remove_registry_entry
from .mapper import IhcMapper
from .yamlhelper import get_controller_conf, read_manual_setup, write_manual_setup
from ..const import IHC_PLATFORMS

_LOGGER = logging.getLogger(__name__)


class ApiManualRemove(ApiBase):
    """IHCViewer api remove resource  requests."""

    name = "api:ihcviewer:manual:remove"
    url = "/api/ihcviewer/manual/remove/{controllerid}/{id}"

    @callback
    async def post(self, request, controllerid, id):
        """handle api post requests"""
        self.initialize(controllerid)
        await IhcMapper.get_mapping(self.hass, controllerid)
        id = int(id)
        platform = await self.hass.async_add_executor_job(
            self.remove_id, controllerid, id
        )
        # Out of the registry as well, or the entity stays behind as an
        # unavailable ghost with its area and labels. Done before the reload,
        # so the entity is gone from Home Assistant whether or not the reload
        # goes through.
        removed = None
        if platform:
            removed = remove_registry_entry(self.hass, controllerid, id, platform)
        result = await put_into_effect(self.hass, controllerid, id)
        result["removed"] = removed
        return self.json(result)

    def remove_id(self, controller_id: str, id: int):
        """Remove the specified ihc resource id.

        Returns the platform it was set up as, or None if it was not in the
        manual setup at all."""
        conf = read_manual_setup(self.hass)
        controller_conf = get_controller_conf(conf, controller_id)
        removed_from = None
        for platform in IHC_PLATFORMS:
            if platform in controller_conf:
                for ihc_device in controller_conf[platform]:
                    if ihc_device["id"] == id:
                        controller_conf[platform].remove(ihc_device)
                        IhcMapper.markremoved(controller_id, id)
                        removed_from = platform
                        break
                # An emptied platform goes too, so the file ends up as it was
                # before the resource was added rather than with an empty
                # "sensor: []" left in it
                if not controller_conf[platform]:
                    del controller_conf[platform]
        write_manual_setup(self.hass, conf)
        return removed_from
