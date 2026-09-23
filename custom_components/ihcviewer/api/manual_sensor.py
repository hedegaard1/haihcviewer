"""ApiManualSensor class"""
import json
import logging

from http import HTTPStatus

from homeassistant.core import callback

from .apibase import ApiBase
from .change import put_into_effect
from .mapper import IhcMapper
from .yamlhelper import (
    find_manual_platform,
    get_controller_conf,
    read_manual_setup,
    write_manual_setup,
)

_LOGGER = logging.getLogger(__name__)


class ApiManualSensor(ApiBase):
    """IHCViewer api make sensor requests."""

    name = "api:ihcviewer:manual:sensor"
    url = "/api/ihcviewer/manual/sensor/{controllerid}"

    @callback
    async def post(self, request, controllerid):
        """handle api post requests"""
        self.initialize(controllerid)
        await IhcMapper.get_mapping(self.hass, controllerid)
        body = await request.text()
        data = json.loads(body) if body else None
        if data is None or not isinstance(data, dict):
            return self.json_message(
                "Body should be a JSON object", HTTPStatus.BAD_REQUEST
            )
        id = int(data["id"])
        name = data.get("name")
        unit = data.get("unit")
        error = await self.hass.async_add_executor_job(
            self.make_sensor, controllerid, id, name, unit
        )
        if error:
            return self.error(error)
        # The change is put into Home Assistant here and now, so there is
        # nothing left to press - and no restart
        return self.json(
            await put_into_effect(self.hass, controllerid, id, "sensor")
        )

    def make_sensor(self, controller_id: str, id: int, name: str, unit: str):
        """Make a new sensor."""
        # Refused with a key the panel says in the user's own language. This
        # used to raise, which reached the panel as a bare 500 that it showed
        # nothing about - the click simply seemed to do nothing.
        if find_manual_platform(self.hass, controller_id, id) or IhcMapper.ismapped(
            controller_id, id
        ):
            return "add_already_set_up"

        conf = read_manual_setup(self.hass)
        controller_conf = get_controller_conf(conf, controller_id)
        sensor = {"id": id, "name": name}
        if unit:
            sensor["unit_of_measurement"] = unit
        if "sensor" not in controller_conf:
            controller_conf["sensor"] = [sensor]
        else:
            controller_conf["sensor"].append(sensor)
        IhcMapper.set(controller_id, id, "not created yet. Reload the ihc integration.", True)
        write_manual_setup(self.hass, conf)
