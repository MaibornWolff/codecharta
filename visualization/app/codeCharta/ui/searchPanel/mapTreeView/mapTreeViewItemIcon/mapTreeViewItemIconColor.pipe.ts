import { Pipe, PipeTransform } from "@angular/core"

import { CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "../../../../state/store/store"
import { getMarkingColor, isLeaf } from "../../../../util/codeMapHelper"

@Pipe({ name: "mapTreeViewItemIconColor", pure: false })
export class MapTreeViewItemIconColorPipe implements PipeTransform {
	static defaultColor = "#000000"
	static areMetricZeroColor = "#BDBDBD"
	static store = Store.store

	transform(value: CodeMapNode): string | undefined {
		const { areaMetric } = MapTreeViewItemIconColorPipe.store.getState().dynamicSettings

		if (!value.attributes[areaMetric]) {
			return MapTreeViewItemIconColorPipe.areMetricZeroColor
		}
		if (isLeaf(value)) {
			return undefined
		}

		const markingColor = getMarkingColor(value, MapTreeViewItemIconColorPipe.store.getState().fileSettings.markedPackages)
		return markingColor || MapTreeViewItemIconColorPipe.defaultColor
	}
}
