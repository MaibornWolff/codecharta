import angular from "angular"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { FilesService } from "./store/files/files.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { ScalingService } from "./store/appSettings/scaling/scaling.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { InjectorService } from "./injector.service"
import { StoreService } from "./store.service"
import "../codeCharta.module"
import camelCase from "lodash.camelcase"
import { ExperimentalFeaturesEnabledService } from "./store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { SharpnessModeService } from "./store/appSettings/sharpnessMode/sharpnessMode.service"

angular
	.module("app.codeCharta.state", ["app.codeCharta"])
	.service(camelCase(IsLoadingFileService.name), IsLoadingFileService)
	.service(camelCase(FilesService.name), FilesService)
	.service(camelCase(MapSizeService.name), MapSizeService)
	.service(camelCase(ScalingService.name), ScalingService)
	.service(camelCase(MarkedPackagesService.name), MarkedPackagesService)
	.service(camelCase(EdgesService.name), EdgesService)
	.service(camelCase(BlacklistService.name), BlacklistService)
	.service(camelCase(InjectorService.name), InjectorService)
	.service(camelCase(StoreService.name), StoreService)
	.service(camelCase(SharpnessModeService.name), SharpnessModeService)
	.service(camelCase(ExperimentalFeaturesEnabledService.name), ExperimentalFeaturesEnabledService)
