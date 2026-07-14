import { Injectable } from "@angular/core"
import { Node } from "../../model/codeCharta.model"
import { ConnectorDrawingService } from "./services/connectorDrawing.service"
import { LabelCollisionService } from "./services/labelCollision.service"
import { LabelCreationService } from "./services/labelCreation.service"

@Injectable({
    providedIn: "root"
})
export class LabelSettingsFacade {
    constructor(
        private readonly labelCreationService: LabelCreationService,
        private readonly labelCollisionService: LabelCollisionService,
        private readonly connectorDrawingService: ConnectorDrawingService
    ) {}

    addLeafLabel(node: Node, highestNodeInSet: number, enforceLabel = false) {
        this.labelCreationService.addLeafLabel(node, highestNodeInSet, enforceLabel)
    }

    clearLabels() {
        this.labelCreationService.clearLabels()
        this.connectorDrawingService.clearConnectors()
    }

    clearTemporaryLabel(hoveredNode: Node) {
        this.labelCreationService.clearTemporaryLabel(hoveredNode)
    }

    hasLabelForNode(node: Node): boolean {
        return this.labelCreationService.hasLabelForNode(node)
    }

    suppressLabelForNode(node: Node) {
        this.labelCreationService.suppressLabelForNode(node)
    }

    restoreSuppressedLabel() {
        this.labelCreationService.restoreSuppressedLabel()
    }

    setSuppressLayout(suppress: boolean) {
        this.labelCollisionService.setSuppressLayout(suppress)
    }

    destroy() {
        this.labelCollisionService.destroy()
        this.connectorDrawingService.destroy()
    }
}
