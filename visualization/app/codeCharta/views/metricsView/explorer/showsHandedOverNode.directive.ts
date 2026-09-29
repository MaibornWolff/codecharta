import { Directive } from "@angular/core"
import { showHandedOverMapNode } from "../../mapExplorer/showHandedOverMapNode"

@Directive({
    selector: "[ccShowsHandedOverNode]"
})
export class ShowsHandedOverNodeDirective {
    constructor() {
        showHandedOverMapNode("metrics")
    }
}
