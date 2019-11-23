import angular from "angular"
// Plop: Append module import here
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { InjectorService } from "./injector.service"
import { StoreService } from "./store.service"
import { EdgeMetricService } from "./edgeMetric.service"
import { SearchPanelService } from "./searchPanel.service"
import { NodeSearchService } from "./nodeSearch.service"
import { FileStateService } from "./fileState.service"
import { SettingsService } from "./settingsService/settings.service"
import { MetricService } from "./metric.service"
import { LoadingStatusService } from "./loadingStatus.service"
import "../codeCharta.module"
import _ from "lodash"
import { IsPresentationModeService } from "./store/appSettings/isPresentationMode/isPresentationMode.service"

angular
	.module("app.codeCharta.state", ["app.codeCharta"])
	// Plop: Append service name here
	.service(_.camelCase(IsPresentationModeService.name), IsPresentationModeService)
	.service(_.camelCase(BlacklistService.name), BlacklistService)
	.service(_.camelCase(InjectorService.name), InjectorService)
	.service(_.camelCase(StoreService.name), StoreService)
	.service(_.camelCase(EdgeMetricService.name), EdgeMetricService)
	.service(_.camelCase(SearchPanelService.name), SearchPanelService)
	.service(_.camelCase(NodeSearchService.name), NodeSearchService)
	.service(_.camelCase(FileStateService.name), FileStateService)
	.service(_.camelCase(SettingsService.name), SettingsService)
	.service(_.camelCase(MetricService.name), MetricService)
	.service(_.camelCase(LoadingStatusService.name), LoadingStatusService)
