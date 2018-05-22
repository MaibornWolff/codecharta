"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular_1 = require("angular");
var aggregate_service_1 = require("./aggregate.service");
require("../../ui/dialog/dialog");
angular_1.default.module("app.codeCharta.core.aggregate", ["app.codeCharta.ui.dialog"]).service(aggregate_service_1.AggregateMapService.SELECTOR, aggregate_service_1.AggregateMapService);
