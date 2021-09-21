import { Pipe, PipeTransform } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

@Pipe({ name: "isLeaf" })
export class IsLeafPipe implements PipeTransform {
	transform(value: CodeMapNode): boolean {
		return isLeaf(value)
	}
}
