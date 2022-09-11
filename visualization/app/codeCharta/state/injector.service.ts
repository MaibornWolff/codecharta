//@ts-nocheck

import { EdgeMetricDataService } from "./store/metricData/edgeMetricData/edgeMetricData.service"
import { NodeMetricDataService } from "./store/metricData/nodeMetricData/nodeMetricData.service"
import { IsAttributeSideBarVisibleService } from "./store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { FilesService } from "./store/files/files.service"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { IsWhiteBackgroundService } from "./store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { ScalingService } from "./store/appSettings/scaling/scaling.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { AttributeTypesService } from "./store/fileSettings/attributeTypes/attributeTypes.service"
import { EdgeMetricService } from "./store/dynamicSettings/edgeMetric/edgeMetric.service"
import { FocusedNodePathService } from "./store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { MetricDataService } from "./store/metricData/metricData.service"
import { ExperimentalFeaturesEnabledService } from "./store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { LayoutAlgorithmService } from "./store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { SharpnessModeService } from "./store/appSettings/sharpnessMode/sharpnessMode.service"
import { CodeMapRenderService } from "../ui/codeMap/codeMap.render.service"
export class InjectorService {
	constructor(
		// We have to inject the services somewhere
		private metricDataService: MetricDataService,
		private edgeMetricDataService: EdgeMetricDataService,
		private nodeMetricDataService: NodeMetricDataService,
		private isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
		private isLoadingFileService: IsLoadingFileService,
		private filesService: FilesService,
		private mapSizeService: MapSizeService,
		private isWhiteBackgroundService: IsWhiteBackgroundService,
		private scalingService: ScalingService,
		private markedPackagesService: MarkedPackagesService,
		private edgesService: EdgesService,
		private attributeTypesService: AttributeTypesService,
		private edgeMetricService: EdgeMetricService,
		private focusedNodePathService: FocusedNodePathService,
		private blacklistService: BlacklistService,
		private layoutAlgorithmService: LayoutAlgorithmService,
		private sharpnessModeService: SharpnessModeService,
		private experimentalFeaturesEnabledService: ExperimentalFeaturesEnabledService,
		private codeMapRenderService: CodeMapRenderService
	) {
		"ngInject"
	}
}
