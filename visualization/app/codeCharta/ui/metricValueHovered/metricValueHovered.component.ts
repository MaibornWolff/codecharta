import "./metricValueHovered.component.scss"

export class MetricValueHoveredController {
	/* @ngInject */
	constructor() {}
}

export const areaMetricValueHoveredComponent = {
	selector: "areaMetricValueHoveredComponent",
	template: require("./metricValueHovered.area.component.html"),
	controller: MetricValueHoveredController
}

export const heightMetricValueHoveredComponent = {
	selector: "heightMetricValueHoveredComponent",
	template: require("./metricValueHovered.height.component.html"),
	controller: MetricValueHoveredController
}

export const colorMetricValueHoveredComponent = {
	selector: "colorMetricValueHoveredComponent",
	template: require("./metricValueHovered.color.component.html"),
	controller: MetricValueHoveredController
}
