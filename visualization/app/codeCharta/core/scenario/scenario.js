"use strict";

import "../settings/settings.js";
import "../data/data.js";

import {ScenarioService} from "./scenarioService.js";

angular.module(
    "app.codeCharta.core.scenario",
    ["app.codeCharta.core.settings"]
);

angular.module("app.codeCharta.core.scenario").service(
    "scenarioService", ScenarioService
);

