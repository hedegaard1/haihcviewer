"""Put a change to the manual setup into effect - with no restart, and nothing
left for the user to press.

The ihc integration reads ihc_manual_setup.yaml when it is set up, and it has
a working unload, so reloading its config entry is enough to add or remove an
entity. Every route that changes the manual setup ends by doing that here, so
by the time the panel gets its answer the entity is there - or gone.
"""
import asyncio
import logging

from homeassistant.core import callback
from homeassistant.helpers import entity_registry as er

from .mapper import IhcMapper

_LOGGER = logging.getLogger(__name__)

IHC_DOMAIN = "ihc"

# The pause before each attempt at reloading, in seconds. A reload logs out of
# the controller and straight back in, and the controller does not always take
# the second login at once: measured on a test installation 23-09-2026, one reload in
# four came back as not loaded, while the next, a minute later, went through.
# The ihc integration then raises ConfigEntryNotReady and Home Assistant retries
# by itself in the background - but the panel would already have said it
# failed, and pointed at a log with nothing in it.
RETRY_DELAYS = (0, 2, 5)


@callback
def find_entry(hass, controller_id: str):
    """The ihc config entry for a controller, loaded or not.

    Looked up among the config entries rather than in hass.data: a reload
    that failed has taken the entry out of hass.data, and the next attempt
    must still be able to find it."""
    for entry in hass.config_entries.async_entries(IHC_DOMAIN):
        if entry.unique_id == controller_id:
            return entry
    return None


async def reload_ihc(hass, controller_id: str) -> bool:
    """Reload the ihc integration, trying again if the controller says no.

    Everything that goes wrong is written to the log, so that "see the log"
    in the panel leads somewhere."""
    entry = find_entry(hass, controller_id)
    if entry is None:
        _LOGGER.error("There is no ihc integration set up for controller %s",
                      controller_id)
        return False
    for attempt, delay in enumerate(RETRY_DELAYS, start=1):
        if delay:
            await asyncio.sleep(delay)
        try:
            if await hass.config_entries.async_reload(entry.entry_id):
                # The entities were made from scratch, so the mapping is stale
                IhcMapper.forget(controller_id)
                return True
            _LOGGER.warning(
                "The ihc integration did not load again (attempt %s of %s)",
                attempt, len(RETRY_DELAYS))
        except Exception:  # noqa: BLE001 - logged, and the next attempt follows
            _LOGGER.exception(
                "Reloading the ihc integration failed (attempt %s of %s)",
                attempt, len(RETRY_DELAYS))
    _LOGGER.error(
        "The ihc integration could not be reloaded for controller %s. The change "
        "to the manual setup is saved, and takes effect the next time the ihc "
        "integration loads", controller_id)
    return False


async def put_into_effect(hass, controller_id: str, id: int, platform=None):
    """Reload the ihc integration after a change, and say how it went.

    Given the platform a resource was just added as, the answer also carries
    the entity id it became - which the panel shows straight away."""
    reloaded = await reload_ihc(hass, controller_id)
    entity_id = None
    if reloaded and platform:
        entity_id = entity_id_for(hass, controller_id, id, platform)
    return {"reloaded": reloaded, "entity_id": entity_id}


@callback
def entity_id_for(hass, controller_id: str, id: int, platform: str):
    """The entity id an ihc resource has as the given platform, if any.

    The ihc integration gives each entity the unique id
    "<controller id>-<ihc id>", and the registry keys on that together with
    the domain - so the same resource has one entry per platform."""
    return er.async_get(hass).async_get_entity_id(
        platform, IHC_DOMAIN, f"{controller_id}-{id}")


@callback
def remove_registry_entry(hass, controller_id: str, id: int, platform: str):
    """Take the entity out of Home Assistant's entity registry.

    Taking a row out of the manual setup stops the ihc integration making the
    entity, but the registry keeps its entry - unavailable, with its area and
    labels - and Home Assistant never clears it by itself. Moving a button
    from switch to binary_sensor left one behind every time, and three old
    ones were found on a test installation that nobody could say where came from.

    Home Assistant does not throw a removed entry away either. It keeps a copy
    in deleted_entities, and when the same domain, platform and unique id turn
    up again it hands back the old entity id, name, area and labels - for as
    long as the ihc config entry exists (async_remove and async_get_or_create
    in helpers/entity_registry.py, core 2026.9.3). Added again, the resource
    would come back under an entity id the add dialog never showed. So the
    copy goes too: removed here means gone.

    Returns the entity id that was removed, or None."""
    registry = er.async_get(hass)
    entity_id = entity_id_for(hass, controller_id, id, platform)
    if entity_id is not None:
        registry.async_remove(entity_id)
    # Also when there was no entry: a resource removed before this was done
    # has only the copy left. deleted_entities is not a documented api - Home
    # Assistant's own purge of old copies does exactly this - so should it
    # ever go, nothing is forgotten and the removal still stands. The log says
    # so, or it would only show as an old entity id turning up again later.
    deleted = getattr(registry, "deleted_entities", None)
    key = (platform, IHC_DOMAIN, f"{controller_id}-{id}")
    if deleted is None:
        _LOGGER.warning(
            "The entity registry has no deleted_entities any more, so Home "
            "Assistant still remembers ihc resource %s as a %s: added again, "
            "it gets its old entity id back", id, platform)
    elif deleted.pop(key, None) is not None:
        registry.async_schedule_save()
    return entity_id
