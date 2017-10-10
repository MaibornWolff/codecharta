"use strict";

import angular from "angular";

import "../url/url.ts";
import "../data/data.ts";
import "../../codeMap/threeViewer/threeViewer.js";

import {SettingsService} from "./settingsService.ts";

angular.module(
    "app.codeCharta.core.settings",
    ["app.codeCharta.core.url", "app.codeCharta.core.data", "app.codeCharta.codeMap.threeViewer"]
);

angular.module("app.codeCharta.core.settings").service(
    "settingsService", SettingsService
);

