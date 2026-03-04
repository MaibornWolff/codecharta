import { Injectable } from "@angular/core"
import { Vector3 } from "three"
import { LabelMode, Node } from "../../../codeCharta.model"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"
import { StateAccessStore } from "../stores/stateAccess.store"
import { LabelElement } from "./labelElement"

export interface InternalLabel {
    labelElement: LabelElement
    node: Node
    buildingTop: Vector3
    appliedOffset: number
}

@Injectable({ providedIn: "root" })
export class LabelCreationService {
    private labels: InternalLabel[] = []
    private suppressedLabel: InternalLabel | null = null

    constructor(
        private readonly stateAccessStore: StateAccessStore,
        private readonly threeSceneService: ThreeSceneService
    ) {}

    getLabels(): InternalLabel[] {
        return this.labels
    }

    getSuppressedLabel(): InternalLabel | null {
        return this.suppressedLabel
    }

    addLeafLabel(node: Node, highestNodeInSet: number, enforceLabel = false) {
        const { appSettings, dynamicSettings } = this.stateAccessStore.getValue()
        const { scaling, showMetricLabelNodeName, showMetricLabelNameValue, labelMode } = appSettings
        const { heightMetric, colorMetric } = dynamicSettings
        const multiplier = new Vector3(scaling.x, scaling.y, scaling.z)

        let nameText = ""
        if (showMetricLabelNodeName || (enforceLabel && !showMetricLabelNameValue)) {
            nameText = node.name
        } else if (!showMetricLabelNameValue) {
            return
        }

        let metricText = ""
        if (showMetricLabelNameValue) {
            const metric = labelMode === LabelMode.Color ? colorMetric : heightMetric
            metricText = `${node.attributes[metric]} ${metric}`
        }

        const labelElement = new LabelElement(nameText, metricText)
        const cssObject = labelElement.cssObject
        cssObject.userData = { node }

        const actualHeight = node.height + Math.abs(node.heightDelta ?? 0)
        const labelHeight = Math.max(actualHeight, highestNodeInSet)

        const x = (node.x0 - treeMapSize + node.width / 2) * multiplier.x
        const z = (node.y0 - treeMapSize + node.length / 2) * multiplier.z

        cssObject.position.set(x, (node.z0 + labelHeight) * multiplier.y, z)

        const buildingTop = new Vector3(x, (node.z0 + actualHeight) * multiplier.y, z)

        this.threeSceneService.labels.add(cssObject)
        this.labels.push({ labelElement, node, buildingTop, appliedOffset: 0 })
    }

    clearLabels() {
        this.threeSceneService.labels.clear()
        this.labels = []
        this.suppressedLabel = null
    }

    clearTemporaryLabel(hoveredNode: Node) {
        const index = this.labels.findIndex(({ node }) => node === hoveredNode)
        if (index > -1) {
            const label = this.labels[index]
            if (label === this.suppressedLabel) {
                this.suppressedLabel = null
            }
            this.threeSceneService.labels.remove(label.labelElement.cssObject)
            this.labels.splice(index, 1)
        }
    }

    hasLabelForNode(node: Node): boolean {
        return this.labels.some(label => label.node === node)
    }

    suppressLabelForNode(node: Node) {
        const label = this.labels.find(l => l.node === node)
        if (label) {
            this.suppressedLabel = label
            label.labelElement.setTransition("opacity 0.2s ease-out")
            label.labelElement.setOpacity("0")
        }
    }

    restoreSuppressedLabel() {
        if (this.suppressedLabel) {
            this.suppressedLabel.labelElement.setOpacity("1")
            this.suppressedLabel = null
        }
    }
}
