"use strict";

import {DeltaCalculatorService} from "./data.deltaCalculator.service";
import {CodeMapNodeDecoratorService} from "../../ui/codeMap/codeMap.nodeDecorator.service";

import angular from "angular";

angular.module("app.codeCharta.core.data",[]);

angular.module("app.codeCharta.core.data").service(
    "dataDecoratorService", CodeMapNodeDecoratorService
);

angular.module("app.codeCharta.core.data").service(
    "deltaCalculatorService", DeltaCalculatorService
);

