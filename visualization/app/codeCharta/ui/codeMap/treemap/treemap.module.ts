"use strict";

import angular from "angular";

import {TreeMapService} from "./treemap.service";

angular.module("app.codeCharta.ui.codeMap.treemap", []);

angular.module("app.codeCharta.ui.codeMap.treemap")
    .service(
        "treeMapService",
        TreeMapService
    );
