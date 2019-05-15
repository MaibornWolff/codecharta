import angular from "angular"
// Plop: Append module import here
import { FileStateService } from "./fileState.service"
import { SettingsService } from "./settings.service"
import { MetricService } from "./metric.service"
import "../ui/loadingGif/loadingGif.module"
import _ from "lodash"

angular
	.module("app.codeCharta.state", ["app.codeCharta.ui.loadingGif"])
	// Plop: Append service name here
	.service(_.camelCase(FileStateService.name), FileStateService)
	.service(_.camelCase(SettingsService.name), SettingsService)
	.service(_.camelCase(MetricService.name), MetricService)
