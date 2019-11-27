// Plop: Append service import here
import { CameraService } from "./store/appSettings/camera/camera.service"
import { ScalingService } from "./store/appSettings/scaling/scaling.service"
import { EdgeHeightService } from "./store/appSettings/edgeHeight/edgeHeight.service"
import { AmountOfEdgePreviewsService } from "./store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { AmountOfTopLabelsService } from "./store/appSettings/amountOfTopLabels/amountOfTopLabels.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { AttributeTypesService } from "./store/fileSettings/attributeTypes/attributeTypes.service"
import { EdgeMetricService } from "./store/dynamicSettings/edgeMetric/edgeMetric.service"
import { ColorRangeService } from "./store/dynamicSettings/colorRange/colorRange.service"
import { MarginService } from "./store/dynamicSettings/margin/margin.service"
import { SearchPatternService } from "./store/dynamicSettings/searchPattern/searchPattern.service"
import { SearchedNodePathsService } from "./store/dynamicSettings/searchedNodePaths/searchedNodePaths.service"
import { FocusedNodePathService } from "./store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { HeightMetricService } from "./store/dynamicSettings/heightMetric/heightMetric.service"
import { DistributionMetricService } from "./store/dynamicSettings/distributionMetric/distributionMetric.service"
import { ColorMetricService } from "./store/dynamicSettings/colorMetric/colorMetric.service"
import { AreaMetricService } from "./store/dynamicSettings/areaMetric/areaMetric.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"

export class InjectorService {
	/* @ngInject */
	constructor(
		// tslint:disable:no-unused-variable
		// We have to inject the services somewhere
		// Plop: Append service injection here
		private cameraService: CameraService,
		private scalingService: ScalingService,
		private edgeHeightService: EdgeHeightService,
		private amountOfEdgePreviewsService: AmountOfEdgePreviewsService,
		private amountOfTopLabelsService: AmountOfTopLabelsService,
		private markedPackagesService: MarkedPackagesService,
		private edgesService: EdgesService,
		private attributeTypesService: AttributeTypesService,
		private edgeMetricService: EdgeMetricService,
		private colorRangeService: ColorRangeService,
		private marginService: MarginService,
		private searchPatternService: SearchPatternService,
		private searchedNodePathsService: SearchedNodePathsService,
		private focusedNodePathService: FocusedNodePathService,
		private heightMetricService: HeightMetricService,
		private distributionMetricService: DistributionMetricService,
		private colorMetricService: ColorMetricService,
		private areaMetricService: AreaMetricService,
		private blacklistService: BlacklistService
	) {}
}
