// Plop: Append module import here
import angular from "angular";
import {FileStateService} from "./fileState.service";
import {SettingsService} from "./settings.service";
import {MetricService} from "./metric.service";
import _ from "lodash"

angular.module(
    "app.codeCharta.state", []
).service(
    _.camelCase(FileStateService.name), FileStateService
).service(
    _.camelCase(SettingsService.name), SettingsService
).service(
    _.camelCase(MetricService.name), MetricService
);
