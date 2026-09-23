"""ApiProject class"""
import logging

from aiohttp import web

from homeassistant.core import callback

from ..const import DATA_PROJECT
from .apibase import ApiBase

_LOGGER = logging.getLogger(__name__)

# The fields from getProjectInfo that say which project the controller is
# running. They change when a new project is sent to it from IHC Visual.
REVISION_KEYS = ("projectMajorRevision", "projectMinorRevision", "lastmodified")


class ApiProject(ApiBase):
    """IHCViewer api project requests.

    The project is read from the controller once and kept, because it is a
    large document - well over a megabyte on a medium sized installation - and
    the controller takes its time delivering it. Before serving it again we ask
    the controller which project it is running, which is a small request, and
    read it again if the answer is not the one we have."""

    name = "api:ihcviewer:project"
    url = "/api/ihcviewer/project/{controllerid}"

    @callback
    async def get(self, request, controllerid):
        """Get request"""
        self.initialize(controllerid)
        projects = self.hass.data.setdefault(DATA_PROJECT, {})
        cached = projects.get(controllerid)
        revision = await self.hass.async_add_executor_job(self.get_revision)
        forced = request.query.get("refresh") == "true"
        # A controller that does not report a revision gives None, and then the
        # cache is kept until someone asks for a refresh.
        if cached is not None and not forced and cached["revision"] == revision:
            return self.project_response(cached["project"])
        project = await self.hass.async_add_executor_job(self.read_project)
        if not project:
            _LOGGER.error("Unable to read the project from the ihc controller")
            # Better the project we have than nothing at all
            if cached is not None:
                return self.project_response(cached["project"])
            return web.Response(status=502)
        projects[controllerid] = {"project": project, "revision": revision}
        return self.project_response(project)

    def get_revision(self):
        """What the controller says about the project it is running."""
        info = self.ihc_controller.client.get_project_info()
        if not info:
            return None
        revision = {key: str(info[key]) for key in REVISION_KEYS if key in info}
        return revision or None

    def read_project(self):
        """Read the project from the controller.

        IHCController keeps the project in _project from the first read and
        never lets go of it - nothing in the sdk clears it - so it has to be
        cleared here or the old project comes straight back. Going through
        get_project() rather than the client keeps the wait for the controller
        to be ready.

        _project is private to the sdk, so a new version may call it something
        else. Then the kept project comes back, and a new one only shows once
        the ihc integration is reloaded - the log says so, rather than leaving
        "Reload project" to quietly do nothing."""
        if hasattr(self.ihc_controller, "_project"):
            self.ihc_controller._project = None  # noqa: SLF001
        else:
            _LOGGER.warning(
                "The ihc sdk keeps the project somewhere other than _project "
                "now, so it cannot be read again until the ihc integration is "
                "reloaded")
        return self.ihc_controller.get_project()

    def project_response(self, project):
        """The project as the xml document the panel parses."""
        return web.Response(
            body=project, content_type="text/xml", charset="utf-8", status=200
        )
