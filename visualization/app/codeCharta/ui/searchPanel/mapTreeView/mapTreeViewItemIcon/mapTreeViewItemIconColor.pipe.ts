import { Pipe, PipeTransform } from "@angular/core"
import { State } from "@ngrx/store"

import { CodeMapNode, CcState } from "../../../../codeCharta.model"
import { getMarkingColor, isLeaf } from "../../../../util/codeMapHelper"
import { isAreaValid } from "../areaMetricValidPipe.pipe"

@Pipe({ name: "mapTreeViewItemIconColor", pure: false })
export class MapTreeViewItemIconColorPipe implements PipeTransform {
	static readonly defaultColor = "#000000"
	static readonly areMetricZeroColor = "#BDBDBD"

	constructor(private state: State<CcState>) {}

	transform(value: CodeMapNode): string | undefined {
		const { areaMetric } = this.state.getValue().dynamicSettings

		if (!isAreaValid(value, areaMetric)) {
			return MapTreeViewItemIconColorPipe.areMetricZeroColor
		}
		if (isLeaf(value)) {
			return undefined
		}

		const markingColor = getMarkingColor(value, this.state.getValue().fileSettings.markedPackages)
		return markingColor || MapTreeViewItemIconColorPipe.defaultColor
	}
}
