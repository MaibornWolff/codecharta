"use strict";

import angular from "angular";

import "../settings/settings.module.ts";
import "../data/data.module.ts";

import {ScenarioService} from "./scenario.service.ts";

angular.module(
    "app.codeCharta.core.scenario",
    ["app.codeCharta.core.settings", "app.codeCharta.core.data"]
);

angular.module("app.codeCharta.core.scenario").service(
    "scenarioService", ScenarioService
);

