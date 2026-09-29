import { Directive } from "@angular/core"
import { showHandedOverMapNode } from "../../mapExplorer/showHandedOverMapNode"

/** Selecting the node also opens the folders around it in the graph. */
@Directive({
    selector: "[ccShowsHandedOverNode]"
})
export class ShowsHandedOverNodeDirective {
    constructor() {
        showHandedOverMapNode("dependencies")
    }
}
