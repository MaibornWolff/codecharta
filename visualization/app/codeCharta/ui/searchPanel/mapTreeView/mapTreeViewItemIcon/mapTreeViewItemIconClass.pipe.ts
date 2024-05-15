import { Pipe, PipeTransform } from "@angular/core"

import { CodeMapNode } from "../../../../codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"

@Pipe({ name: "mapTreeViewItemIconClass" })
export class MapTreeViewItemIconClassPipe implements PipeTransform {
    transform(value: CodeMapNode, isOpen: boolean): string {
        if (isLeaf(value)) {
            return "fa fa-file-o"
        }
        if (isOpen) {
            return "fa fa-folder-open"
        }
        return "fa fa-folder"
    }
}
