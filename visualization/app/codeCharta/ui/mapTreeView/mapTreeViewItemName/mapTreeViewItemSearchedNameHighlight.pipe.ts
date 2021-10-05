import { Pipe, PipeTransform } from "@angular/core"

@Pipe({ name: "mapTreeViewItemSearchedNameHighlight" })
export class MapTreeViewItemSearchedNameHighlightPipe implements PipeTransform {
	transform(value: Set<string>, nodePath: string): boolean {
		return value.has(nodePath)
	}
}
