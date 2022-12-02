import "./metricChooser.component.scss"
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { nodeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { Observable } from "rxjs"
import { AttributeDescriptor, AttributeDescriptors, EdgeMetricData, NodeMetricData } from "../../codeCharta.model"
import { edgeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { metricTitles } from "../../util/metric/metricTitles"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"
import { createSelector } from "../../state/angular-redux/createSelector"
import { MetricChooserMetric } from "./metricChooserMetric"

type MetricChooserType = "node" | "edge"

@Component({
	selector: "cc-metric-chooser",
	template: require("./metricChooser.component.html")
})
export class MetricChooserComponent implements OnInit {
	@Input() selectedMetricName: string
	@Input() searchPlaceholder: string
	@Input() handleMetricChanged: (newSelectedMetricName: string) => void
	@Input() type: MetricChooserType = "node"
	@Input() isDisabled = false
	@ViewChild("searchTermInput") searchTermInput: ElementRef<HTMLInputElement>
	searchTerm = ""
	nodeMetricData$: Observable<NodeMetricData[] | EdgeMetricData[]>
	metricDataWithDescription$: Observable<MetricChooserMetric[]>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.nodeMetricData$ = this.store.select(this.type === "node" ? nodeMetricDataSelector : edgeMetricDataSelector)

		this.metricDataWithDescription$ = this.store.select(
			createSelector(
				[attributeDescriptorsSelector, nodeMetricDataSelector, edgeMetricDataSelector],
				(attributeDescriptors, nodeMetricData, edgeMetricData) =>
					getMetricDataWithDescription(this.type, attributeDescriptors, nodeMetricData, edgeMetricData)
			)
		)
	}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
		} else {
			this.searchTerm = ""
		}
	}
}

function getMetricDataWithDescription(
	type: string,
	attributeDescriptors: AttributeDescriptors,
	nodeMetricData: NodeMetricData[],
	edgeMetricData: EdgeMetricData[]
): MetricChooserMetric[] {
	const metricChooserMetric: MetricChooserMetric[] = []
	if (type === "node") {
		for (const nodeMetricDatum of nodeMetricData) {
			metricChooserMetric.push(getMetricChooserMetric(nodeMetricDatum, attributeDescriptors))
		}
	} else {
		for (const edgeMetricDatum of edgeMetricData) {
			metricChooserMetric.push(getMetricChooserMetric(edgeMetricDatum, attributeDescriptors))
		}
	}

	return metricChooserMetric
}

function getMetricChooserMetric(
	metricData: NodeMetricData | EdgeMetricData,
	attributeDescriptors: AttributeDescriptors
): MetricChooserMetric {
	const attributeDescriptor = getAttributeDescriptor(metricData.name, attributeDescriptors)
	if (attributeDescriptor === undefined) {
		return {
			name: metricData.name,
			title: metricTitles.get(metricData.name),
			description: undefined,
			minValue: metricData.minValue,
			maxValue: metricData.maxValue,
			hintLowValue: undefined,
			hintMaxValue: undefined
		}
	}

	return {
		name: metricData.name,
		title: getMetricName(metricData.name, attributeDescriptor),
		description: attributeDescriptor.description,
		minValue: metricData.minValue,
		maxValue: metricData.maxValue,
		hintLowValue: attributeDescriptor.hintLowValue,
		hintMaxValue: attributeDescriptor.hintHighValue
	}
}

function getAttributeDescriptor(metricName: string, attributeDescriptors: AttributeDescriptors): AttributeDescriptor {
	if (attributeDescriptors === undefined) {
		return undefined
	}
	return attributeDescriptors[metricName]
}

function getMetricName(metric: string, attributeDescriptor: AttributeDescriptor) {
	if (attributeDescriptor?.title !== undefined && attributeDescriptor.title !== "") {
		return attributeDescriptor.title
	}
	//Fallback Description can still return null
	return metricTitles.get(metric)
}
