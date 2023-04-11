import { Pipe, PipeTransform } from "@angular/core"
import { State as StateService } from "@ngrx/store"

import { CodeMapNode, CcState } from "../../../../codeCharta.model"
import { getMarkingColor, isLeaf } from "../../../../util/codeMapHelper"

@Pipe({ name: "mapTreeViewItemIconColor", pure: false })
export class MapTreeViewItemIconColorPipe implements PipeTransform {
	static defaultColor = "#000000"
	static areMetricZeroColor = "#BDBDBD"

	constructor(private state: StateService<CcState>) {}

	transform(value: CodeMapNode): string | undefined {
		const { areaMetric } = this.state.getValue().dynamicSettings

		if (!value.attributes[areaMetric]) {
			return MapTreeViewItemIconColorPipe.areMetricZeroColor
		}
		if (isLeaf(value)) {
			return undefined
		}

		const markingColor = getMarkingColor(value, this.state.getValue().fileSettings.markedPackages)
		return markingColor || MapTreeViewItemIconColorPipe.defaultColor
	}
}
