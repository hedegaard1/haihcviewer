"""Tests for the parts of the Python api that decide something by themselves.

    python -m unittest discover -s tests      (or npm test, which runs both)

Runs on Python's own unittest, with nothing to install. The integration is
loaded file by file, with small stand-ins for the parts of Home Assistant it
imports: importing it the normal way runs its __init__.py, which needs a
whole Home Assistant to get through.

What is tested is our own logic - which platform an id is already set up as,
and whether a new entity id may be used. Home Assistant itself is not tested:
where the code leans on it, the stand-in does exactly what Home Assistant
does, and says where that was copied from.
"""
import importlib.util
import os
import re
import sys
import types
import unittest

ROOT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "custom_components", "ihcviewer")


def _module(name, **attributes):
    module = types.ModuleType(name)
    module.__dict__.update(attributes)
    sys.modules[name] = module
    return module


def _package(name, path):
    package = _module(name)
    package.__path__ = [path]
    return package


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


# Copied from homeassistant/core.py. The rule for what an entity id may look
# like is Home Assistant's; what we test is that we ask it at the right time.
VALID_ENTITY_ID = re.compile(r"^(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_)$")


def _stand_ins():
    """The parts of Home Assistant the tested files import, and no more."""
    _module("homeassistant")
    _module("homeassistant.core",
            HomeAssistant=object,
            callback=lambda func: func,
            valid_entity_id=lambda entity_id: VALID_ENTITY_ID.match(entity_id) is not None)
    _module("homeassistant.helpers")
    _module("homeassistant.helpers.entity_registry")
    _module("homeassistant.components")
    _module("homeassistant.components.http", HomeAssistantView=object)
    # The yaml library is only used to read the file, and the tests hand the
    # parsed file in directly
    _module("ruamel")
    _module("ruamel.yaml", YAML=object)
    _module("aiohttp", web=types.SimpleNamespace(Response=object))

    _package("ihcviewer", ROOT)
    _package("ihcviewer.api", os.path.join(ROOT, "api"))
    _load("ihcviewer.const", os.path.join(ROOT, "const.py"))
    _module("ihcviewer.api.mapper", IhcMapper=_Mapper)


class _Mapper:
    """Stands in for IhcMapper: remembers which mappings were forgotten, and
    takes no notice of the rest."""
    forgotten = []

    @staticmethod
    def forget(controller_id):
        _Mapper.forgotten.append(controller_id)

    @staticmethod
    def ismapped(controller_id, id):
        return False

    @staticmethod
    def set(*args):
        pass

    @staticmethod
    def markremoved(*args):
        pass


_stand_ins()
yamlhelper = _load("ihcviewer.api.yamlhelper", os.path.join(ROOT, "api", "yamlhelper.py"))
_load("ihcviewer.api.apibase", os.path.join(ROOT, "api", "apibase.py"))
entity = _load("ihcviewer.api.entity", os.path.join(ROOT, "api", "entity.py"))
change = _load("ihcviewer.api.change", os.path.join(ROOT, "api", "change.py"))
manual_light = _load("ihcviewer.api.manual_light", os.path.join(ROOT, "api", "manual_light.py"))
manual_remove = _load("ihcviewer.api.manual_remove", os.path.join(ROOT, "api", "manual_remove.py"))
project = _load("ihcviewer.api.project", os.path.join(ROOT, "api", "project.py"))

CONTROLLER = "VN0000000000"


def manual_setup(*controllers):
    return {"ihc": list(controllers)}


class FindManualPlatformTest(unittest.TestCase):
    """The duplicate guard: which platform an id already stands under."""

    def find(self, conf, id, controller=CONTROLLER):
        # read_manual_setup is what reads the file - the rest is the lookup
        original = yamlhelper.read_manual_setup
        yamlhelper.read_manual_setup = lambda hass: conf
        try:
            return yamlhelper.find_manual_platform(None, controller, id)
        finally:
            yamlhelper.read_manual_setup = original

    # Rows the way they stand in a real ihc_manual_setup.yaml
    CONF = manual_setup({
        "controller": CONTROLLER,
        "switch": [{"id": 82779, "name": "Siren Alarm (Hallway)"}],
        "binary_sensor": [
            {"id": 26714, "name": "4-Button Switch - Living room door (TR) (Bedroom)",
             "type": "opening"},
            {"id": 8422162, "name": "IHC Alarm Away (Alarm)", "type": "lock",
             "inverting": True},
        ],
        "light": [{"id": 1513819, "name": "Ceiling IHC Lampeudtag (Dining room)"}],
    })

    def test_finds_the_platform_an_id_stands_under(self):
        self.assertEqual(self.find(self.CONF, 26714), "binary_sensor")
        self.assertEqual(self.find(self.CONF, 82779), "switch")
        self.assertEqual(self.find(self.CONF, 1513819), "light")

    def test_an_id_not_set_up_is_free(self):
        self.assertIsNone(self.find(self.CONF, 18522))

    def test_only_looks_at_its_own_controller(self):
        conf = manual_setup(
            {"controller": "OTHER", "light": [{"id": 18522, "name": "x"}]},
            {"controller": CONTROLLER, "switch": []},
        )
        self.assertIsNone(self.find(conf, 18522))
        self.assertEqual(self.find(conf, 18522, controller="OTHER"), "light")

    def test_a_controller_not_in_the_file_has_nothing_set_up(self):
        self.assertIsNone(self.find(manual_setup(), 26714))
        self.assertIsNone(self.find(self.CONF, 26714, controller="NOT_THERE"))

    def test_an_emptied_platform_is_an_empty_list(self):
        # What the panel leaves behind when the last row of a platform is
        # removed
        conf = manual_setup({"controller": CONTROLLER, "binary_sensor": []})
        self.assertIsNone(self.find(conf, 26714))

    def test_the_same_id_twice_names_the_first(self):
        # The situation the guard exists to prevent - but a file that already
        # has it must still give an answer, not fail
        conf = manual_setup({
            "controller": CONTROLLER,
            "binary_sensor": [{"id": 1513819, "name": "x"}],
            "light": [{"id": 1513819, "name": "y"}],
        })
        self.assertEqual(self.find(conf, 1513819), "binary_sensor")


class _ParsedFile:
    """Stands in for the yaml library: hands back a file already parsed."""

    def __init__(self, parsed):
        self.parsed = parsed

    def load(self, file):
        return self.parsed


class ReadManualSetupTest(unittest.TestCase):
    """The file shaped the way the ihc integration reads it.

    The ihc integration runs ihc_manual_setup.yaml through a schema with
    ensure_list on "ihc" and on every platform, so a controller written as a
    single mapping, and a platform with nothing under it, are both valid there.
    Everything in the panel that reads the file expects lists."""

    def setUp(self):
        import tempfile
        self.folder = tempfile.mkdtemp()
        self.hass = types.SimpleNamespace(config=types.SimpleNamespace(
            path=lambda name: os.path.join(self.folder, name)))
        self.original_yaml = yamlhelper._yaml

    def tearDown(self):
        import shutil
        yamlhelper._yaml = self.original_yaml
        shutil.rmtree(self.folder, ignore_errors=True)

    def read(self, parsed):
        """read_manual_setup on a file whose content parses to `parsed`."""
        with open(os.path.join(self.folder, "ihc_manual_setup.yaml"), "w",
                  encoding="utf-8") as file:
            file.write("# stand-in\n")
        yamlhelper._yaml = lambda: _ParsedFile(parsed)
        return yamlhelper.read_manual_setup(self.hass)

    def test_no_file_is_nothing_set_up(self):
        self.assertEqual(yamlhelper.read_manual_setup(self.hass), {"ihc": []})

    def test_an_empty_file_is_nothing_set_up(self):
        # An empty yaml file parses to None
        self.assertEqual(self.read(None), {"ihc": []})

    def test_ihc_with_nothing_under_it(self):
        self.assertEqual(self.read({"ihc": None}), {"ihc": []})

    def test_a_file_without_ihc(self):
        self.assertEqual(self.read({"something_else": 1})["ihc"], [])

    def test_a_list_of_controllers_is_left_as_it_is(self):
        controllers = [{"controller": CONTROLLER, "light": [{"id": 1, "name": "x"}]}]
        self.assertEqual(self.read({"ihc": controllers}), {"ihc": controllers})

    def test_a_single_controller_written_as_a_mapping(self):
        conf = self.read({"ihc": {"controller": CONTROLLER,
                                  "light": [{"id": 1513819, "name": "x"}]}})
        self.assertEqual(conf["ihc"], [{"controller": CONTROLLER,
                                        "light": [{"id": 1513819, "name": "x"}]}])
        self.assertEqual(
            yamlhelper.get_controller_conf(conf, CONTROLLER)["light"][0]["id"], 1513819)

    def test_a_platform_with_nothing_under_it_is_an_empty_list(self):
        conf = self.read({"ihc": [{"controller": CONTROLLER, "binary_sensor": None,
                                   "light": [{"id": 1, "name": "x"}]}]})
        self.assertEqual(conf["ihc"][0]["binary_sensor"], [])
        self.assertEqual(conf["ihc"][0]["light"], [{"id": 1, "name": "x"}])

    def test_a_platform_that_is_not_there_is_not_added(self):
        # Only what is in the file is shaped - nothing is written in that the
        # user did not write
        conf = self.read({"ihc": [{"controller": CONTROLLER}]})
        self.assertEqual(conf["ihc"][0], {"controller": CONTROLLER})

    def test_every_reader_can_then_add_to_the_platform(self):
        # The four add routes append to the list they find - a None there was
        # an AttributeError in the middle of adding a resource
        conf = self.read({"ihc": [{"controller": CONTROLLER, "switch": None}]})
        yamlhelper.get_controller_conf(conf, CONTROLLER)["switch"].append({"id": 5})
        self.assertEqual(conf["ihc"][0]["switch"], [{"id": 5}])


class _Registry:
    def __init__(self, *entity_ids):
        self.entries = set(entity_ids)

    def async_get(self, entity_id):
        return object() if entity_id in self.entries else None


class _States:
    def __init__(self, *entity_ids):
        self.entity_ids = set(entity_ids)

    def get(self, entity_id):
        return object() if entity_id in self.entity_ids else None


class CheckEntityIdTest(unittest.TestCase):
    """Whether a new entity id may be used, and the reason if it may not."""

    def check(self, new, old="binary_sensor.patio_br", registry=(), states=()):
        view = entity.ApiEntity.__new__(entity.ApiEntity)
        view.hass = types.SimpleNamespace(states=_States(*states))
        return view.check_entity_id(_Registry(*registry), old, new)

    def test_a_free_id_in_the_same_domain_may_be_used(self):
        self.assertIsNone(self.check("binary_sensor.stue_nederst_hojre"))

    def test_the_domain_cannot_change(self):
        self.assertEqual(self.check("light.patio_br"), "rename_id_domain")
        self.assertEqual(self.check("switch.patio_br"), "rename_id_domain")

    def test_an_id_home_assistant_would_refuse(self):
        for new in ("binary_sensor", "binary_sensor.", ".patio",
                    "binary_sensor.Patio", "binary_sensor.patio door",
                    "binary_sensor.patio__br", "binary_sensor._patio",
                    "binary_sensor.patio_", "binary_sensor.stue.hojre",
                    "binary_sensor.stue-hojre", "binary_sensor.højre"):
            with self.subTest(new=new):
                self.assertEqual(self.check(new), "rename_id_invalid")

    def test_the_form_is_checked_before_the_domain(self):
        # A malformed id gets the message about the form, even if its domain
        # is also wrong - it is the first thing to fix
        self.assertEqual(self.check("Light.X"), "rename_id_invalid")

    def test_an_id_in_the_registry_is_taken(self):
        self.assertEqual(
            self.check("binary_sensor.stue", registry=["binary_sensor.stue"]),
            "rename_id_taken")

    def test_an_id_with_a_state_but_no_registry_entry_is_taken(self):
        # A template sensor or a group set up in yaml
        self.assertEqual(
            self.check("binary_sensor.stue", states=["binary_sensor.stue"]),
            "rename_id_taken")

    def test_other_entities_do_not_block_it(self):
        self.assertIsNone(self.check(
            "binary_sensor.stue",
            registry=["binary_sensor.kokken", "light.stue"],
            states=["sensor.stue"]))


class _Entry:
    def __init__(self, entry_id, unique_id):
        self.entry_id = entry_id
        self.unique_id = unique_id


class _ConfigEntries:
    """Stands in for hass.config_entries. Each reload gives the next of the
    results it was handed: True, False, or an exception to raise."""

    def __init__(self, entries, results=()):
        self.entries = entries
        self.results = list(results)
        self.reloaded = []

    def async_entries(self, domain):
        return self.entries if domain == "ihc" else []

    async def async_reload(self, entry_id):
        self.reloaded.append(entry_id)
        result = self.results.pop(0)
        if isinstance(result, Exception):
            raise result
        return result


class _EntityRegistry:
    """Keyed the way Home Assistant's is: domain, platform and unique id.

    Removing an entry keeps a copy of it in deleted_entities, as Home
    Assistant does (async_remove in helpers/entity_registry.py, core 2026.9.3)."""

    def __init__(self, entries):
        self.entries = dict(entries)
        self.deleted_entities = {}
        self.saves = 0

    def async_get_entity_id(self, domain, platform, unique_id):
        return self.entries.get((domain, platform, unique_id))

    def async_remove(self, entity_id):
        for key, value in list(self.entries.items()):
            if value == entity_id:
                del self.entries[key]
                if hasattr(self, "deleted_entities"):
                    self.deleted_entities[key] = value

    def async_schedule_save(self):
        self.saves += 1


class ReloadTest(unittest.TestCase):
    """Putting a change into effect: the reload, and trying again."""

    def setUp(self):
        import asyncio
        self.waited = []
        self.original_sleep = asyncio.sleep

        async def sleep(seconds):
            self.waited.append(seconds)
        asyncio.sleep = sleep
        _Mapper.forgotten = []

    def tearDown(self):
        import asyncio
        asyncio.sleep = self.original_sleep

    def reload(self, *results, entries=None):
        import asyncio
        if entries is None:
            entries = [_Entry("the-entry", CONTROLLER)]
        self.entries = _ConfigEntries(entries, results)
        hass = types.SimpleNamespace(config_entries=self.entries)
        return asyncio.run(change.reload_ihc(hass, CONTROLLER))

    def test_a_reload_that_goes_through_the_first_time(self):
        self.assertTrue(self.reload(True))
        self.assertEqual(self.entries.reloaded, ["the-entry"])
        self.assertEqual(self.waited, [])
        # The entities were made from scratch, so the mapping must be rebuilt
        self.assertEqual(_Mapper.forgotten, [CONTROLLER])

    def test_the_controller_refusing_the_new_login_at_first(self):
        # The case measured on a test installation: not loaded, then fine a little later
        with self.assertLogs(change._LOGGER, "WARNING"):
            self.assertTrue(self.reload(False, False, True))
        self.assertEqual(len(self.entries.reloaded), 3)
        self.assertEqual(self.waited, [2, 5])

    def test_an_exception_is_logged_and_tried_again(self):
        with self.assertLogs(change._LOGGER, "WARNING") as log:
            self.assertTrue(self.reload(RuntimeError("controller busy"), True))
        self.assertIn("attempt 1 of 3", "\n".join(log.output))

    def test_giving_up_says_so_in_the_log(self):
        # "See the log" in the panel must lead somewhere
        with self.assertLogs(change._LOGGER, "ERROR") as log:
            self.assertFalse(self.reload(False, False, False))
        self.assertEqual(len(self.entries.reloaded), 3)
        self.assertIn("could not be reloaded", "\n".join(log.output))
        self.assertEqual(_Mapper.forgotten, [])

    def test_the_entry_is_found_by_the_controller_serial(self):
        entries = [_Entry("other", "OTHER"), _Entry("ours", CONTROLLER)]
        self.assertTrue(self.reload(True, entries=entries))
        self.assertEqual(self.entries.reloaded, ["ours"])

    def test_no_ihc_integration_for_the_controller(self):
        with self.assertLogs(change._LOGGER, "ERROR"):
            self.assertFalse(self.reload(entries=[_Entry("other", "OTHER")]))
        self.assertEqual(self.entries.reloaded, [])


class RegistryTest(unittest.TestCase):
    """What becomes of an entity's entry in the registry."""

    def setUp(self):
        self.registry = _EntityRegistry({
            ("switch", "ihc", f"{CONTROLLER}-532058"): "switch.prove",
            ("binary_sensor", "ihc", f"{CONTROLLER}-532058"): "binary_sensor.prove",
            ("binary_sensor", "ihc", f"{CONTROLLER}-18522"): "binary_sensor.patio_br",
            ("switch", "zha", f"{CONTROLLER}-532058"): "switch.not_ihc",
        })
        sys.modules["homeassistant.helpers.entity_registry"].async_get = lambda hass: self.registry
        self.hass = object()

    def test_the_entity_a_resource_became(self):
        self.assertEqual(
            change.entity_id_for(self.hass, CONTROLLER, 532058, "binary_sensor"),
            "binary_sensor.prove")
        self.assertIsNone(change.entity_id_for(self.hass, CONTROLLER, 532058, "light"))

    def test_removing_takes_only_that_platform(self):
        # The same resource can have an entry per platform - removing it as a
        # switch leaves the binary sensor, and the other integration, alone
        removed = change.remove_registry_entry(self.hass, CONTROLLER, 532058, "switch")
        self.assertEqual(removed, "switch.prove")
        self.assertEqual(sorted(self.registry.entries.values()),
                         ["binary_sensor.patio_br", "binary_sensor.prove", "switch.not_ihc"])

    def test_removing_what_is_not_there(self):
        self.assertIsNone(change.remove_registry_entry(self.hass, CONTROLLER, 99, "switch"))
        self.assertEqual(len(self.registry.entries), 4)

    def test_removing_forgets_home_assistants_copy(self):
        # Kept, the copy hands its old entity id back when the resource is
        # added again - and that is not the id the add dialog promised
        change.remove_registry_entry(self.hass, CONTROLLER, 532058, "switch")
        self.assertNotIn(("switch", "ihc", f"{CONTROLLER}-532058"),
                         self.registry.deleted_entities)
        self.assertEqual(self.registry.saves, 1)

    def test_a_copy_left_from_before_is_forgotten_too(self):
        # Removed before this was done, so only the copy is left
        key = ("light", "ihc", f"{CONTROLLER}-532058")
        self.registry.deleted_entities[key] = "light.prove"
        self.assertIsNone(change.remove_registry_entry(self.hass, CONTROLLER, 532058, "light"))
        self.assertNotIn(key, self.registry.deleted_entities)

    def test_other_copies_are_left_alone(self):
        self.registry.deleted_entities.update({
            ("switch", "zha", f"{CONTROLLER}-532058"): "switch.zha",
            ("binary_sensor", "ihc", f"{CONTROLLER}-532058"): "binary_sensor.old",
        })
        change.remove_registry_entry(self.hass, CONTROLLER, 532058, "switch")
        self.assertEqual(sorted(self.registry.deleted_entities.values()),
                         ["binary_sensor.old", "switch.zha"])

    def test_nothing_to_forget_saves_nothing(self):
        change.remove_registry_entry(self.hass, CONTROLLER, 99, "switch")
        self.assertEqual(self.registry.saves, 0)

    def test_a_registry_without_the_copies(self):
        # deleted_entities is not a documented api. Should it go, removing
        # still works - the entity just comes back with its old id, as before
        # - and the log says so, rather than it turning up as a mystery later
        del self.registry.deleted_entities
        with self.assertLogs(change._LOGGER, "WARNING") as log:
            self.assertEqual(
                change.remove_registry_entry(self.hass, CONTROLLER, 532058, "switch"),
                "switch.prove")
        self.assertIn("deleted_entities", "\n".join(log.output))


class _ManualFile:
    """Stands in for reading and writing ihc_manual_setup.yaml in a module:
    hands out the file it was given, and keeps what is written back."""

    def __init__(self, module, conf):
        self.module = module
        self.conf = conf
        self.written = None
        self.original = {name: getattr(module, name) for name in
                         ("read_manual_setup", "write_manual_setup")}
        module.read_manual_setup = lambda hass: self.conf
        module.write_manual_setup = lambda hass, conf: setattr(self, "written", conf)

    def restore(self):
        for name, value in self.original.items():
            setattr(self.module, name, value)


class AddLightTest(unittest.TestCase):
    """What a light added from the panel is written as."""

    def setUp(self):
        self.file = _ManualFile(manual_light, manual_setup({"controller": CONTROLLER}))
        self.find = manual_light.find_manual_platform
        manual_light.find_manual_platform = lambda hass, controller_id, id: None
        self.api = manual_light.ApiManualLight(object())

    def tearDown(self):
        self.file.restore()
        manual_light.find_manual_platform = self.find

    def written_light(self):
        return self.file.written["ihc"][0]["light"][0]

    def test_a_light_level_is_dimmable(self):
        # Without it the ihc integration makes an on/off light, and a dimmer
        # added from the panel could not be dimmed (measured on a test installation)
        self.assertIsNone(self.api.make_light(CONTROLLER, 8751123, "Spots", None, None, True))
        self.assertEqual(self.written_light(),
                         {"id": 8751123, "name": "Spots", "dimmable": True})

    def test_an_on_off_output_says_nothing_about_dimming(self):
        self.api.make_light(CONTROLLER, 1517330, "Lamp", 1516305, 1516561, False)
        self.assertEqual(self.written_light(), {
            "id": 1517330, "name": "Lamp", "on_id": 1516305, "off_id": 1516561})


class RemoveIdTest(unittest.TestCase):
    """What is left of the file when a resource is taken out of it."""

    def setUp(self):
        self.conf = manual_setup({
            "controller": CONTROLLER,
            "switch": [{"id": 82779, "name": "a"}, {"id": 1517330, "name": "b"}],
            "sensor": [{"id": 8753680, "name": "c"}],
        })
        self.file = _ManualFile(manual_remove, self.conf)
        self.api = manual_remove.ApiManualRemove(object())

    def tearDown(self):
        self.file.restore()

    def test_the_last_row_takes_its_platform_with_it(self):
        # An empty "sensor: []" was left behind in the file - harmless, but
        # the file was no longer the one the user had before
        self.assertEqual(self.api.remove_id(CONTROLLER, 8753680), "sensor")
        self.assertNotIn("sensor", self.file.written["ihc"][0])

    def test_the_other_rows_stay(self):
        self.assertEqual(self.api.remove_id(CONTROLLER, 1517330), "switch")
        self.assertEqual(self.file.written["ihc"][0]["switch"], [{"id": 82779, "name": "a"}])

    def test_an_id_that_is_not_there(self):
        self.assertIsNone(self.api.remove_id(CONTROLLER, 99))
        self.assertEqual(len(self.file.written["ihc"][0]["switch"]), 2)


class _Controller:
    """Stands in for ihcsdk's IHCController: keeps the project from the first
    read in _project, and reads it again only when that is None."""

    def __init__(self):
        self._project = "the project it read first"

    def get_project(self):
        if self._project is None:
            self._project = "the project the controller runs now"
        return self._project


class _RenamedController:
    """An sdk where the kept project is no longer called _project."""

    def __init__(self):
        self._kept = "the project it read first"

    def get_project(self):
        return self._kept


class ReadProjectTest(unittest.TestCase):
    """Reading the project again, past the sdk's own copy of it."""

    def read(self, controller):
        api = project.ApiProject(object())
        api.ihc_controller = controller
        return api.read_project()

    def test_the_kept_project_is_let_go(self):
        self.assertEqual(self.read(_Controller()), "the project the controller runs now")

    def test_an_sdk_without_it_says_so(self):
        # _project is private to the sdk. A new version may call it something
        # else, and then the project cannot be read again - the log says so
        with self.assertLogs(project._LOGGER, "WARNING") as log:
            self.assertEqual(self.read(_RenamedController()), "the project it read first")
        self.assertIn("_project", "\n".join(log.output))


class ServeCachedTest(unittest.TestCase):
    """Whether the kept project is served again or read from the controller."""

    kept = {"project": "<project/>", "revision": {"projectMajorRevision": "1"}}

    def test_the_same_revision_is_served_from_the_cache(self):
        self.assertTrue(project.serve_cached(self.kept, {"projectMajorRevision": "1"}))

    def test_a_new_revision_is_read(self):
        self.assertFalse(project.serve_cached(self.kept, {"projectMajorRevision": "2"}))

    def test_nothing_kept_is_read(self):
        self.assertFalse(project.serve_cached(None, {"projectMajorRevision": "1"}))

    def test_a_controller_without_a_revision_is_read_every_time(self):
        # None == None would otherwise keep the first project for good
        self.assertFalse(project.serve_cached({"project": "<project/>", "revision": None}, None))


if __name__ == "__main__":
    unittest.main()
