"use strict";

import angular from "angular";

import "../data/data.module";
import {TreeMapService} from "./treemap.service";

angular.module("app.codeCharta.core.treemap", []);

angular.module("app.codeCharta.core.treemap").service("treeMapService", TreeMapService);
