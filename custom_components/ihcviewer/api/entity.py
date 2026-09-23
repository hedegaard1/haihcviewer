"""ApiEntity class"""
import logging

from http import HTTPStatus

from homeassistant.core import callback, valid_entity_id
from homeassistant.helpers import entity_registry as er

from .apibase import ApiBase
from .mapper import IhcMapper

_LOGGER = logging.getLogger(__name__)


class ApiEntity(ApiBase):
    """Rename the entity an ihc resource has become.

    The ihc integration gives every entity a unique id of its own -
    "<controller id>-<ihc id>" - so the entities are in Home Assistant's entity
    registry. That is what makes this possible at all: the registry holds a
    display name and an entity id per entity, keeps them across a restart, and
    applies them again when the ihc integration is reloaded and the entities
    are built from scratch. Nothing here touches the manual setup yaml, and
    nothing here needs a restart to take effect.
    """

    name = "api:ihcviewer:entity"
    url = "/api/ihcviewer/entity/{controllerid}"

    @callback
    async def post(self, request, controllerid):
        """Give the entity a new display name, a new entity id, or both."""
        self.initialize(controllerid)
        await IhcMapper.get_mapping(self.hass, controllerid)
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Expected json", HTTPStatus.BAD_REQUEST)

        entity_id = data.get("entity_id")
        if not entity_id:
            return self.error("rename_no_entity")

        registry = er.async_get(self.hass)
        entry = registry.async_get(entity_id)
        if entry is None:
            return self.error("rename_not_in_registry")
        # Only the entities from this controller. The panel cannot ask for
        # anything else, but this view can be called by anything that is
        # logged in, and renaming a stranger's entity is not our business.
        if not entry.unique_id or not entry.unique_id.startswith(f"{controllerid}-"):
            return self.error("rename_not_ours")

        changes = {}

        if "name" in data:
            name = (data.get("name") or "").strip()
            # An empty name is not an error - it puts the entity back on the
            # name the ihc integration gave it, which is what the field being
            # cleared should mean.
            changes["name"] = name or None

        new_entity_id = (data.get("new_entity_id") or "").strip().lower()
        if new_entity_id and new_entity_id != entity_id:
            error = self.check_entity_id(registry, entity_id, new_entity_id)
            if error:
                return self.error(error)
            changes["new_entity_id"] = new_entity_id

        if not changes:
            return self.json({"entity_id": entity_id, "name": entry.name})

        try:
            entry = registry.async_update_entity(entity_id, **changes)
        except ValueError as err:
            _LOGGER.error("Could not rename %s: %s", entity_id, err)
            return self.error("rename_failed")

        if entry.entity_id != entity_id:
            IhcMapper.rename(controllerid, data.get("id"), entry.entity_id)
        return self.json({"entity_id": entry.entity_id, "name": entry.name})

    def check_entity_id(self, registry, entity_id: str, new_entity_id: str):
        """Whether the new entity id can be used, and why not if it cannot."""
        if not valid_entity_id(new_entity_id):
            return "rename_id_invalid"
        # The domain is what the entity is - a binary sensor cannot become a
        # light by being renamed - so only the part after the dot is ours to
        # change. Home Assistant would refuse it anyway, with a message that
        # does not say why.
        if new_entity_id.split(".")[0] != entity_id.split(".")[0]:
            return "rename_id_domain"
        if registry.async_get(new_entity_id) is not None:
            return "rename_id_taken"
        # An entity id that is not in the registry can still be in use - a
        # template sensor or a group set up in yaml has a state but no entry.
        if self.hass.states.get(new_entity_id) is not None:
            return "rename_id_taken"
        return None
