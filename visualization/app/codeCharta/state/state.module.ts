import angular from "angular"
// Plop: Append module import here
import { NodeSearchService } from "./nodeSearch.service"
import { FileStateService } from "./fileState.service"
import { SettingsService } from "./settings.service"
import { MetricService } from "./metric.service"
import "../ui/loadingGif/loadingGif.module"
import "../codeCharta.module"
import _ from "lodash"

angular
	.module("app.codeCharta.state", ["app.codeCharta.ui.loadingGif", "app.codeCharta"])
	// Plop: Append service name here
	.service(_.camelCase(NodeSearchService.name), NodeSearchService)
	.service(_.camelCase(FileStateService.name), FileStateService)
	.service(_.camelCase(SettingsService.name), SettingsService)
	.service(_.camelCase(MetricService.name), MetricService)
