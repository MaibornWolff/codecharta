// Plop: Append module import here
import angular from "angular";
import {FileStateService} from "./fileState.service";
import {SettingsService} from "./settings.service";
import {MetricService} from "./metric.service";
import "../ui/loadingGif/loadingGif.module"

angular.module(
    "app.codeCharta.state", ["app.codeCharta.ui.loadingGif"]
).service(
    "fileStateService", FileStateService
).service(
    "settingsService", SettingsService
).service(
    "metricService", MetricService
);
