import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { InspectorWidthService } from "../../services/inspectorWidth.service"
import { ColumnResizeHandleDirective } from "../columnResizeHandle/columnResizeHandle.directive"

@Component({
    selector: "cc-inspector-resize-handle",
    template: "",
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [ColumnResizeHandleDirective],
    host: { "data-testid": "inspector-resize-handle" }
})
export class InspectorResizeHandleComponent {
    constructor() {
        const widthService = inject(InspectorWidthService)
        const handle = inject(ColumnResizeHandleDirective)
        // An inspector is anchored to the right of its view, so it is its left edge that moves.
        handle.edge = "left"
        handle.widthChange.subscribe(width => widthService.setWidth(width))
        handle.resizeEnd.subscribe(() => widthService.rememberWidth())
        handle.widthReset.subscribe(() => widthService.reset())
    }
}
