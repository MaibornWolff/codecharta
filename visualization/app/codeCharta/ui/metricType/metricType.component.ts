import "./metricType.component.scss"

export class MetricTypeController {
	/* @ngInject */
	constructor() {}
}

export const metricTypeComponent = {
	selector: "metricTypeComponent",
	template: require("./metricType.component.html"),
	controller: MetricTypeController
}
