import { Pipe, PipeTransform } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/store/store"
import { getMarkingColor, isLeaf } from "../../../util/codeMapHelper"

@Pipe({ name: "mapTreeViewItemIconColor" })
export class MapTreeViewItemIconColorPipe implements PipeTransform {
	static defaultColor = "#000000"
	static store = Store.store

	transform(value: CodeMapNode): string | undefined {
		if (isLeaf(value)) return undefined
		const markingColor = getMarkingColor(value, MapTreeViewItemIconColorPipe.store.getState().fileSettings.markedPackages)
		return markingColor ? markingColor : MapTreeViewItemIconColorPipe.defaultColor
	}
}
