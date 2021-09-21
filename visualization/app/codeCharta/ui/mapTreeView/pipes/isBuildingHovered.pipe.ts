import { Pipe, PipeTransform } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"

@Pipe({ name: "isHoveredBuilding" })
export class IsHoveredBuildingPipe implements PipeTransform {
	transform(value: CodeMapNode, hoveredBuildingId: string) {
		return Boolean(value?.path && hoveredBuildingId === value.path)
	}
}
