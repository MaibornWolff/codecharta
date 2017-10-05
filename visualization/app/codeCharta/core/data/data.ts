"use strict";

import {DataService} from "./dataService.ts";
import {DataValidatorService} from "./dataValidatorService.ts";
import {DataLoadingService} from "./dataLoadingService.ts";
import {DeltaCalculatorService} from "./deltaCalculatorService.ts";
import {DataDecoratorService} from "./dataDecoratorService.ts";

import angular from "angular";

angular.module("app.codeCharta.core.data",[]);

angular.module("app.codeCharta.core.data").service(
    "dataDecoratorService", DataDecoratorService
);

angular.module("app.codeCharta.core.data").service(
    "dataLoadingService", DataLoadingService
);


angular.module("app.codeCharta.core.data").service(
    "dataService", DataService
);

angular.module("app.codeCharta.core.data").service(
    "dataValidatorService", DataValidatorService
);

angular.module("app.codeCharta.core.data").service(
    "deltaCalculatorService", DeltaCalculatorService
);

