"use strict";

import {DataService} from "./dataService.js";
import {DataValidatorService} from "./dataValidatorService.js";
import {DataLoadingService} from "./dataLoadingService.js";
import {DeltaCalculatorService} from "./deltaCalculatorService.js";
import {DataDecoratorService} from "./dataDecoratorService.js";


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

