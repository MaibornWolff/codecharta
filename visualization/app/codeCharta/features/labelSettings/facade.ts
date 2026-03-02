import { Injectable } from "@angular/core"
import { LabelModeService } from "./services/labelMode.service"
import { AmountOfTopLabelsService } from "./services/amountOfTopLabels.service"
import { ShowMetricLabelNodeNameService } from "./services/showMetricLabelNodeName.service"
import { ShowMetricLabelNameValueService } from "./services/showMetricLabelNameValue.service"
import { ColorLabelsService } from "./services/colorLabels.service"
import { GroupLabelCollisionsService } from "./services/groupLabelCollisions.service"
import { LabelCreationService } from "./services/labelCreation.service"
import { LabelCollisionService } from "./services/labelCollision.service"
import { ColorLabelOptions, LabelMode, Node } from "../../codeCharta.model"

@Injectable({
    providedIn: "root"
})
export class LabelSettingsFacade {
    constructor(
        private readonly labelModeService: LabelModeService,
        private readonly amountOfTopLabelsService: AmountOfTopLabelsService,
        private readonly showMetricLabelNodeNameService: ShowMetricLabelNodeNameService,
        private readonly showMetricLabelNameValueService: ShowMetricLabelNameValueService,
        private readonly colorLabelsService: ColorLabelsService,
        private readonly groupLabelCollisionsService: GroupLabelCollisionsService,
        private readonly labelCreationService: LabelCreationService,
        private readonly labelCollisionService: LabelCollisionService
    ) {}

    // Settings observables
    labelMode$() {
        return this.labelModeService.labelMode$()
    }

    amountOfTopLabels$() {
        return this.amountOfTopLabelsService.amountOfTopLabels$()
    }

    showMetricLabelNodeName$() {
        return this.showMetricLabelNodeNameService.showMetricLabelNodeName$()
    }

    showMetricLabelNameValue$() {
        return this.showMetricLabelNameValueService.showMetricLabelNameValue$()
    }

    colorLabels$() {
        return this.colorLabelsService.colorLabels$()
    }

    groupLabelCollisions$() {
        return this.groupLabelCollisionsService.groupLabelCollisions$()
    }

    // Settings mutations
    setLabelMode(value: LabelMode) {
        this.labelModeService.setLabelMode(value)
    }

    setAmountOfTopLabels(value: number) {
        this.amountOfTopLabelsService.setAmountOfTopLabels(value)
    }

    setShowMetricLabelNodeName(value: boolean) {
        this.showMetricLabelNodeNameService.setShowMetricLabelNodeName(value)
    }

    setShowMetricLabelNameValue(value: boolean) {
        this.showMetricLabelNameValueService.setShowMetricLabelNameValue(value)
    }

    setColorLabels(value: Partial<ColorLabelOptions>) {
        this.colorLabelsService.setColorLabels(value)
    }

    setGroupLabelCollisions(value: boolean) {
        this.groupLabelCollisionsService.setGroupLabelCollisions(value)
    }

    // Label rendering
    addLeafLabel(node: Node, highestNodeInSet: number, enforceLabel = false) {
        this.labelCreationService.addLeafLabel(node, highestNodeInSet, enforceLabel)
    }

    clearLabels() {
        this.labelCreationService.clearLabels()
        this.labelCollisionService.clearConnectors()
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

    scale() {
        this.labelCreationService.scale()
    }

    setSuppressLayout(suppress: boolean) {
        this.labelCollisionService.setSuppressLayout(suppress)
    }

    destroy() {
        this.labelCollisionService.destroy()
    }
}
