import angular from "angular"
import { RecentFilesService } from "./store/dynamicSettings/recentFiles/recentFiles.service"
import { NodeMetricDataService } from "./store/metricData/nodeMetricData/nodeMetricData.service"
import { CameraTargetService } from "./store/appSettings/cameraTarget/cameraTarget.service"
import { IsAttributeSideBarVisibleService } from "./store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { FilesService } from "./store/files/files.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { ShowOnlyBuildingsWithEdgesService } from "./store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"
import { IsWhiteBackgroundService } from "./store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { CameraService } from "./store/appSettings/camera/camera.service"
import { ScalingService } from "./store/appSettings/scaling/scaling.service"
import { EdgeHeightService } from "./store/appSettings/edgeHeight/edgeHeight.service"
import { AmountOfEdgePreviewsService } from "./store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { AttributeTypesService } from "./store/fileSettings/attributeTypes/attributeTypes.service"
import { EdgeMetricService } from "./store/dynamicSettings/edgeMetric/edgeMetric.service"
import { FocusedNodePathService } from "./store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { InjectorService } from "./injector.service"
import { StoreService } from "./store.service"
import "../codeCharta.module"
import camelCase from "lodash.camelcase"
import { IsPresentationModeService } from "./store/appSettings/isPresentationMode/isPresentationMode.service"
import { EdgeMetricDataService } from "./store/metricData/edgeMetricData/edgeMetricData.service"
import { MetricDataService } from "./store/metricData/metricData.service"
import { ExperimentalFeaturesEnabledService } from "./store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { LayoutAlgorithmService } from "./store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { SharpnessModeService } from "./store/appSettings/sharpnessMode/sharpnessMode.service"
import { ScreenshotToClipboardEnabledService } from "./store/appSettings/enableClipboard/screenshotToClipboardEnabled.service"

angular
	.module("app.codeCharta.state", ["app.codeCharta"])
	.service(camelCase(RecentFilesService.name), RecentFilesService)
	.service(camelCase(MetricDataService.name), MetricDataService)
	.service(camelCase(EdgeMetricDataService.name), EdgeMetricDataService)
	.service(camelCase(NodeMetricDataService.name), NodeMetricDataService)
	.service(camelCase(CameraTargetService.name), CameraTargetService)
	.service(camelCase(IsAttributeSideBarVisibleService.name), IsAttributeSideBarVisibleService)
	.service(camelCase(IsLoadingFileService.name), IsLoadingFileService)
	.service(camelCase(FilesService.name), FilesService)
	.service(camelCase(MapSizeService.name), MapSizeService)
	.service(camelCase(ShowOnlyBuildingsWithEdgesService.name), ShowOnlyBuildingsWithEdgesService)
	.service(camelCase(IsWhiteBackgroundService.name), IsWhiteBackgroundService)
	.service(camelCase(CameraService.name), CameraService)
	.service(camelCase(ScalingService.name), ScalingService)
	.service(camelCase(EdgeHeightService.name), EdgeHeightService)
	.service(camelCase(AmountOfEdgePreviewsService.name), AmountOfEdgePreviewsService)
	.service(camelCase(MarkedPackagesService.name), MarkedPackagesService)
	.service(camelCase(EdgesService.name), EdgesService)
	.service(camelCase(AttributeTypesService.name), AttributeTypesService)
	.service(camelCase(EdgeMetricService.name), EdgeMetricService)
	.service(camelCase(FocusedNodePathService.name), FocusedNodePathService)
	.service(camelCase(IsPresentationModeService.name), IsPresentationModeService)
	.service(camelCase(BlacklistService.name), BlacklistService)
	.service(camelCase(InjectorService.name), InjectorService)
	.service(camelCase(StoreService.name), StoreService)
	.service(camelCase(LayoutAlgorithmService.name), LayoutAlgorithmService)
	.service(camelCase(SharpnessModeService.name), SharpnessModeService)
	.service(camelCase(ExperimentalFeaturesEnabledService.name), ExperimentalFeaturesEnabledService)
	.service(camelCase(ScreenshotToClipboardEnabledService.name), ScreenshotToClipboardEnabledService)
