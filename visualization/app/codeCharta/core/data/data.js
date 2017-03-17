"use strict";

import {DataService} from "./dataService.js";
import {DataValidatorService} from "./dataValidatorService.js";

angular.module("app.codeCharta.core.data",[]);

angular.module("app.codeCharta.core.data").service(
    "dataService", DataService
);

angular.module("app.codeCharta.core.data").service(
    "dataValidatorService", DataValidatorService
);
