"use strict";

import "../data/data.js";
import {TreeMapService} from "./treeMapService.js";

angular.module("app.codeCharta.core.treemap", ["app.codeCharta.core.data"]);

angular.module("app.codeCharta.core.treemap").service("treeMapService", TreeMapService);
