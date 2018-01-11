"use strict";

import angular from "angular";

import "../settings/settings.module";
import "../data/data.module";

import {ScenarioService} from "./scenario.service";

angular.module(
    "app.codeCharta.core.scenario",
    ["app.codeCharta.core.settings", "app.codeCharta.core.data"]
);

angular.module("app.codeCharta.core.scenario").service(
    "scenarioService", ScenarioService
);

