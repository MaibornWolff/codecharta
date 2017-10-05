"use strict";

import angular from "angular";

import "../data/data.ts";
import {TreeMapService} from "./treeMapService.ts";

angular.module("app.codeCharta.core.treemap", ["app.codeCharta.core.data"]);

angular.module("app.codeCharta.core.treemap").service("treeMapService", TreeMapService);
