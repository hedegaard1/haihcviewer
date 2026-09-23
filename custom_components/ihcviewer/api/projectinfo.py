"""ApiProjectInfo class"""
import logging

from http import HTTPStatus

from homeassistant.core import callback

from .apibase import ApiBase

_LOGGER = logging.getLogger(__name__)


class ApiProjectInfo(ApiBase):
    """IHCViewer api project info requests.

    getProjectInfo is a small soap request telling which project the controller
    is running. It is cheap enough to ask on every visit, which is how the panel
    finds out that the project it is showing is no longer the one on the
    controller - without reading the whole project to find out."""

    name = "api:ihcviewer:projectinfo"
    url = "/api/ihcviewer/projectinfo/{controllerid}"

    @callback
    async def get(self, request, controllerid):
        """Get request"""
        self.initialize(controllerid)
        info = await self.hass.async_add_executor_job(
            self.ihc_controller.client.get_project_info
        )
        if not info:
            return self.json_message(
                "Unable to read the project info from the ihc controller",
                HTTPStatus.BAD_GATEWAY,
            )
        return self.json(info)
