import { Injectable } from "@angular/core"
import { Vector3 } from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import { LabelMode, Node } from "../../../codeCharta.model"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"
import { StateAccessStore } from "../stores/stateAccess.store"

export interface InternalLabel {
    cssObject: CSS2DObject
    node: Node
    buildingTop: Vector3
    appliedOffset: number
}

@Injectable({ providedIn: "root" })
export class LabelCreationService {
    private static readonly BASE_OFFSET_PX = -20

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

        const labelElement = this.createLabelElement(nameText, metricText)
        const cssObject = new CSS2DObject(labelElement)
        cssObject.center.set(0.5, 1)

        const actualHeight = node.height + Math.abs(node.heightDelta ?? 0)
        const labelHeight = Math.max(actualHeight, highestNodeInSet)

        const x = (node.x0 - treeMapSize + node.width / 2) * multiplier.x
        const z = (node.y0 - treeMapSize + node.length / 2) * multiplier.z

        cssObject.position.set(x, (node.z0 + labelHeight) * multiplier.y, z)
        cssObject.userData = { node }

        const buildingTop = new Vector3(x, (node.z0 + actualHeight) * multiplier.y, z)

        this.threeSceneService.labels.add(cssObject)
        this.labels.push({ cssObject, node, buildingTop, appliedOffset: 0 })
    }

    clearLabels() {
        for (const label of this.labels) {
            this.threeSceneService.labels.remove(label.cssObject)
        }
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
            this.threeSceneService.labels.remove(label.cssObject)
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
            const content = label.cssObject.element.firstElementChild as HTMLDivElement
            if (content) {
                content.style.transition = "opacity 0.2s ease-out"
                content.style.opacity = "0"
            }
        }
    }

    restoreSuppressedLabel() {
        if (this.suppressedLabel) {
            const content = this.suppressedLabel.cssObject.element.firstElementChild as HTMLDivElement
            if (content) {
                content.style.opacity = "1"
            }
            this.suppressedLabel = null
        }
    }

    scale() {
        // CSS2DRenderer handles projection automatically.
        // Labels are cleared and recreated on scale changes,
        // so no manual position adjustment is needed.
    }

    private createLabelElement(nameText: string, metricText: string): HTMLDivElement {
        const wrapper = document.createElement("div")
        const content = document.createElement("div")
        content.style.cssText = this.buildLabelStyles()

        if (nameText) {
            const nameSpan = document.createElement("span")
            nameSpan.style.cssText = "display: block; font-weight: 500;"
            nameSpan.textContent = nameText
            content.appendChild(nameSpan)
        }

        if (metricText) {
            const metricSpan = document.createElement("span")
            metricSpan.style.cssText = "display: block; font-size: 10px; color: #666; margin-top: 1px;"
            metricSpan.textContent = metricText
            content.appendChild(metricSpan)
        }

        wrapper.appendChild(content)
        return wrapper
    }

    private buildLabelStyles(): string {
        return `
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            border-radius: 6px;
            padding: 4px 8px;
            font-family: Roboto, 'Helvetica Neue', sans-serif;
            font-size: 12px;
            line-height: 1.3;
            color: #1a1a1a;
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
            transform: translateY(${LabelCreationService.BASE_OFFSET_PX}px);
            opacity: 0;
            transition: opacity 0.2s ease-out;
        `
    }
}
