"use strict";

import {DeltaGenerator} from "../../util/deltaGenerator";
import {CodeMapNodeDecoratorService} from "../../ui/codeMap/codeMap.nodeDecorator.service";

import angular from "angular";

angular.module("app.codeCharta.core.data",[]);

angular.module("app.codeCharta.core.data").service(
    "dataDecoratorService", CodeMapNodeDecoratorService
);

angular.module("app.codeCharta.core.data").service(
    "deltaCalculatorService", DeltaGenerator
);

