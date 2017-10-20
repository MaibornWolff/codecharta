"use strict";

import {DataService} from "./data.service.ts";
import {DataValidatorService} from "./data.validator.service.ts";
import {DataLoadingService} from "./data.loading.service.ts";
import {DeltaCalculatorService} from "./data.deltaCalculator.service.ts";
import {DataDecoratorService} from "./data.decorator.service.ts";

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

