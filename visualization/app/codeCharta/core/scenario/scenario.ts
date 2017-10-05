"use strict";

import angular from "angular";

import "../settings/settings.ts";
import "../data/data.ts";

import {ScenarioService} from "./scenarioService.ts";

angular.module(
    "app.codeCharta.core.scenario",
    ["app.codeCharta.core.settings", "app.codeCharta.core.data"]
);

angular.module("app.codeCharta.core.scenario").service(
    "scenarioService", ScenarioService
);

