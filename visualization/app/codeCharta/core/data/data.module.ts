"use strict";

import {DeltaCalculatorService} from "./data.deltaCalculator.service";
import {DataDecoratorService} from "./data.decorator.service";

import angular from "angular";

angular.module("app.codeCharta.core.data",[]);

angular.module("app.codeCharta.core.data").service(
    "dataDecoratorService", DataDecoratorService
);

angular.module("app.codeCharta.core.data").service(
    "deltaCalculatorService", DeltaCalculatorService
);

