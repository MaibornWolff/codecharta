// Plop: Append module import here
import angular from "angular";
import {FileStateService} from "./fileState.service";
import {SettingsService} from "./settings.service";
import {MetricService} from "./metric.service";

angular.module(
    "app.codeCharta.state", []
).service(
    "fileStateService", FileStateService
).service(
    "settingsService", SettingsService
).service(
    "metricService", MetricService
);
