"use strict"

import { DataService } from "./data.service"
import { DataValidatorService } from "./data.validator.service"
import { DataLoadingService } from "./data.loading.service"
import { DeltaCalculatorService } from "./data.deltaCalculator.service"
import { DataDecoratorService } from "./data.decorator.service"

import angular from "angular"

angular.module("app.codeCharta.core.data", [])

angular.module("app.codeCharta.core.data").service("dataDecoratorService", DataDecoratorService)

angular.module("app.codeCharta.core.data").service("dataLoadingService", DataLoadingService)

angular.module("app.codeCharta.core.data").service("dataService", DataService)

angular.module("app.codeCharta.core.data").service("dataValidatorService", DataValidatorService)

angular.module("app.codeCharta.core.data").service("deltaCalculatorService", DeltaCalculatorService)
