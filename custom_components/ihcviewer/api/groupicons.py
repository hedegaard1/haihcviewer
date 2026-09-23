"""ApiGroupIcons class"""
import logging

from http import HTTPStatus

from homeassistant.core import callback
from homeassistant.helpers.storage import Store

from ..const import DATA_GROUPICONS, STORAGE_KEY_GROUPICONS, STORAGE_VERSION
from .apibase import ApiBase

_LOGGER = logging.getLogger(__name__)


class ApiGroupIcons(ApiBase):
    """The icons someone has picked for the rooms.

    The project says nothing about what a room looks like - it only has a name,
    in whatever language the installer used - so there is nothing to read an
    icon from and nothing worth guessing from either. The choice is the user's,
    and it is kept here rather than in the browser so the rooms look the same on
    every phone and every browser in the house.

    Home Assistant's own store keeps it, which means .storage rather than a file
    in the configuration folder: it is not something anyone edits by hand, and a
    config folder is crowded enough already."""

    name = "api:ihcviewer:groupicons"
    url = "/api/ihcviewer/groupicons/{controllerid}"

    @callback
    async def get(self, request, controllerid):
        """The icons picked for this controller's rooms."""
        icons = await self.read(controllerid)
        return self.json(icons)

    @callback
    async def post(self, request, controllerid):
        """Pick the icon for one room, or clear it.

        An empty icon removes the choice, so the room goes back to the folder
        rather than leaving an empty string behind that nothing can draw."""
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Expected json", HTTPStatus.BAD_REQUEST)
        group_id = data.get("id")
        if group_id is None:
            return self.json_message("No room id", HTTPStatus.BAD_REQUEST)
        icon = (data.get("icon") or "").strip()
        stored = await self.load()
        icons = stored.setdefault(controllerid, {})
        if icon:
            icons[str(group_id)] = icon
        else:
            icons.pop(str(group_id), None)
        await self.store().async_save(stored)
        return self.json(icons)

    def store(self) -> Store:
        """The store, made once and kept in hass.data."""
        store = self.hass.data.get(DATA_GROUPICONS)
        if store is None:
            store = Store(self.hass, STORAGE_VERSION, STORAGE_KEY_GROUPICONS)
            self.hass.data[DATA_GROUPICONS] = store
        return store

    async def load(self) -> dict:
        """Everything in the store, for every controller."""
        stored = await self.store().async_load()
        return stored if isinstance(stored, dict) else {}

    async def read(self, controllerid: str) -> dict:
        """The icons for one controller."""
        stored = await self.load()
        icons = stored.get(controllerid)
        return icons if isinstance(icons, dict) else {}
