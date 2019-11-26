// Plop: Append service import here
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
		private heightMetricService: HeightMetricService,
		private distributionMetricService: DistributionMetricService,
		private colorMetricService: ColorMetricService,
		private areaMetricService: AreaMetricService,
		private blacklistService: BlacklistService
	) {}
}
