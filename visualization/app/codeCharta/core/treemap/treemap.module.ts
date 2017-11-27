"use strict";

import angular from "angular";

import "../data/data.module.ts";
import {TreeMapService} from "./treemap.service.ts";

angular.module("app.codeCharta.core.treemap", ["app.codeCharta.core.data"]);

angular.module("app.codeCharta.core.treemap").service(TreeMapService.SELECTOR, TreeMapService);
