import { Vector3 } from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import { Node, CcState } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeRendererService } from "./threeViewer/threeRenderer.service"
import { Injectable } from "@angular/core"
import { treeMapSize } from "../../util/algorithm/treeMapLayout/treeMapHelper"
import { CodeMapTooltipService } from "./codeMap.tooltip.service"
import { State } from "@ngrx/store"

interface InternalLabel {
    cssObject: CSS2DObject
    node: Node
    buildingTop: Vector3
}

interface LabelLayoutInfo {
    label: InternalLabel
    content: HTMLDivElement
    rect: DOMRect
    offset: number
}

@Injectable({ providedIn: "root" })
export class CodeMapLabelService {
    private static readonly LABEL_GAP_PX = 4
    private static readonly BASE_OFFSET_PX = -20
    private static readonly MIN_CONNECTOR_LENGTH = 6
    private static readonly MAX_DISPLACEMENT_PX = 100

    private labels: InternalLabel[] = []
    private connectorSvg: SVGSVGElement | null = null
    private readonly projectionVec = new Vector3()
    private suppressedLabel: InternalLabel | null = null
    private _suppressLayout = false

    constructor(
        private readonly state: State<CcState>,
        private threeSceneService: ThreeSceneService,
        private threeRendererService: ThreeRendererService,
        private tooltipService: CodeMapTooltipService
    ) {
        this.threeRendererService.afterRender$.subscribe(() => this.updateLabelLayout())
    }

    addLeafLabel(node: Node, highestNodeInSet: number, enforceLabel = false) {
        const { appSettings, dynamicSettings } = this.state.getValue()
        const { scaling, showMetricLabelNodeName, showMetricLabelNameValue } = appSettings
        const { heightMetric } = dynamicSettings
        const multiplier = new Vector3(scaling.x, scaling.y, scaling.z)

        let nameText = ""
        if (showMetricLabelNodeName || (enforceLabel && !showMetricLabelNameValue)) {
            nameText = node.name
        } else if (!showMetricLabelNameValue) {
            return
        }

        let metricText = ""
        if (showMetricLabelNameValue) {
            metricText = `${node.attributes[heightMetric]} ${heightMetric}`
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
        this.labels.push({ cssObject, node, buildingTop })
    }

    clearLabels() {
        for (const label of this.labels) {
            this.threeSceneService.labels.remove(label.cssObject)
        }
        this.threeSceneService.labels.clear()
        this.labels = []
        this.clearConnectors()
    }

    clearTemporaryLabel(hoveredNode: Node) {
        const index = this.labels.findIndex(({ node }) => node === hoveredNode)
        if (index > -1) {
            const label = this.labels[index]
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

    setSuppressLayout(suppress: boolean) {
        this._suppressLayout = suppress
    }

    updateLabelLayout() {
        if (this._suppressLayout || this.labels.length === 0) {
            this.clearConnectors()
            return
        }

        const infos = this.collectLabelInfos()
        const tooltipRect = this.tooltipService.getRect()
        this.resolveCollisions(infos, tooltipRect)
        this.drawConnectors(infos)
    }

    private collectLabelInfos(): LabelLayoutInfo[] {
        const infos: LabelLayoutInfo[] = []

        // Phase 1: Reset collision offsets (batch writes — all style mutations before any rect reads)
        for (const label of this.labels) {
            const content = label.cssObject.element.firstElementChild as HTMLDivElement
            if (!content) {
                continue
            }
            content.style.transform = `translateY(${CodeMapLabelService.BASE_OFFSET_PX}px)`
            infos.push({ label, content, rect: null, offset: 0 })
        }

        // Phase 2: Read all bounding rects after writes are complete.
        // Grouping all getBoundingClientRect calls here (rather than interleaving them with style
        // mutations) limits the number of forced layout recalculations to one per update cycle.
        for (const info of infos) {
            info.rect = info.content.getBoundingClientRect()
        }

        return infos
    }

    private resolveCollisions(infos: LabelLayoutInfo[], tooltipRect: DOMRect | null) {
        // Sort by screen Y and compute collision offsets (greedy sweep)
        infos.sort((a, b) => a.rect.top - b.rect.top)

        for (let i = 0; i < infos.length; i++) {
            const current = infos[i]
            this.resolveTooltipCollision(current, tooltipRect)
            this.resolveLabelCollisions(current, infos, i)
        }

        this.applyCollisionOffsets(infos)
    }

    private resolveTooltipCollision(current: LabelLayoutInfo, tooltipRect: DOMRect | null) {
        if (!tooltipRect) {
            return
        }

        const currentTop = current.rect.top + current.offset
        const currentBottom = current.rect.bottom + current.offset
        const horizontalOverlap = current.rect.right > tooltipRect.left && current.rect.left < tooltipRect.right
        const verticalOverlap = currentBottom > tooltipRect.top && currentTop < tooltipRect.bottom

        if (horizontalOverlap && verticalOverlap) {
            const overlap = tooltipRect.bottom + CodeMapLabelService.LABEL_GAP_PX - currentTop
            if (overlap > 0) {
                current.offset += overlap
            }
        }
    }

    private resolveLabelCollisions(current: LabelLayoutInfo, infos: LabelLayoutInfo[], index: number) {
        for (let j = index - 1; j >= 0; j--) {
            const above = infos[j]

            if (current.rect.right <= above.rect.left || current.rect.left >= above.rect.right) {
                continue
            }

            const aboveBottom = above.rect.bottom + above.offset
            const currentTop = current.rect.top + current.offset
            const overlap = aboveBottom + CodeMapLabelService.LABEL_GAP_PX - currentTop

            if (overlap > 0) {
                current.offset += overlap
            }
        }
    }

    private applyCollisionOffsets(infos: LabelLayoutInfo[]) {
        for (const info of infos) {
            const content = info.content
            content.style.transition = "transform 0.2s ease-out, opacity 0.2s ease-out"
            const isSuppressed = info.label === this.suppressedLabel

            if (info.offset > CodeMapLabelService.MAX_DISPLACEMENT_PX) {
                content.style.opacity = "0"
                content.style.transform = `translateY(${CodeMapLabelService.BASE_OFFSET_PX}px)`
            } else if (info.offset === 0) {
                content.style.opacity = isSuppressed ? "0" : "1"
            } else {
                content.style.opacity = isSuppressed ? "0" : "1"
                content.style.transform = `translateY(${CodeMapLabelService.BASE_OFFSET_PX + info.offset}px)`
            }
        }
    }

    private drawConnectors(infos: LabelLayoutInfo[]) {
        const svg = this.getOrCreateConnectorSvg()
        if (!svg) {
            return
        }
        svg.innerHTML = ""

        const camera = this.threeRendererService.camera
        if (!camera) {
            return
        }

        const container = this.threeRendererService.labelRenderer?.domElement
        if (!container) {
            return
        }

        const containerRect = container.getBoundingClientRect()
        const halfWidth = container.clientWidth / 2
        const halfHeight = container.clientHeight / 2

        for (const info of infos) {
            // Project actual building top to screen space
            this.projectionVec.copy(info.label.buildingTop)
            this.projectionVec.project(camera)

            if (
                this.projectionVec.z < -1 ||
                this.projectionVec.z > 1 ||
                this.projectionVec.x < -1 ||
                this.projectionVec.x > 1 ||
                this.projectionVec.y < -1 ||
                this.projectionVec.y > 1
            ) {
                continue
            }

            const anchorX = this.projectionVec.x * halfWidth + halfWidth
            const anchorY = -this.projectionVec.y * halfHeight + halfHeight

            // Skip hidden labels (excessive displacement or suppressed by tooltip)
            if (info.offset > CodeMapLabelService.MAX_DISPLACEMENT_PX || info.label === this.suppressedLabel) {
                continue
            }

            // Label bottom-center (rect was read before offset, so add offset for displaced labels)
            const labelX = info.rect.left - containerRect.left + info.rect.width / 2
            const labelY = info.rect.bottom - containerRect.top + info.offset

            // Skip if label endpoint is outside the canvas (collision offset pushed it off-screen)
            if (labelY < 0 || labelY > container.clientHeight || labelX < 0 || labelX > container.clientWidth) {
                continue
            }

            // Skip if label is below or at its anchor (displacement reversed the natural direction)
            if (labelY >= anchorY) {
                continue
            }

            // Skip if the connector would be too short to be meaningful
            const distance = Math.hypot(anchorX - labelX, anchorY - labelY)
            if (distance < CodeMapLabelService.MIN_CONNECTOR_LENGTH) {
                continue
            }

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
            line.setAttribute("x1", String(anchorX))
            line.setAttribute("y1", String(anchorY))
            line.setAttribute("x2", String(labelX))
            line.setAttribute("y2", String(labelY))
            line.setAttribute("stroke", "rgba(180, 180, 180, 0.9)")
            line.setAttribute("stroke-width", "2")
            svg.appendChild(line)
        }
    }

    private getOrCreateConnectorSvg(): SVGSVGElement | null {
        if (this.connectorSvg) {
            return this.connectorSvg
        }

        const container = this.threeRendererService.labelRenderer?.domElement
        if (!container) {
            return null
        }

        this.connectorSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.connectorSvg.style.cssText =
            "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible;"
        container.appendChild(this.connectorSvg)
        return this.connectorSvg
    }

    destroy() {
        this.clearLabels()
        if (this.connectorSvg) {
            this.connectorSvg.remove()
            this.connectorSvg = null
        }
    }

    private clearConnectors() {
        if (this.connectorSvg) {
            this.connectorSvg.innerHTML = ""
        }
    }

    private createLabelElement(nameText: string, metricText: string): HTMLDivElement {
        const wrapper = document.createElement("div")
        const content = document.createElement("div")
        content.style.cssText = this.buildLabelStyles()
        this.applyLabelOpacity(content)

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

        this.appendLabelToDom(wrapper, content)
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
            transform: translateY(${CodeMapLabelService.BASE_OFFSET_PX}px);
            opacity: 0;
            transition: opacity 0.2s ease-out;
        `
    }

    private appendLabelToDom(wrapper: HTMLDivElement, content: HTMLDivElement): void {
        wrapper.appendChild(content)
    }

    private applyLabelOpacity(element: HTMLDivElement): void {
        // rAF defers the opacity change to the next paint frame so that the browser has already
        // committed the element's initial opacity: 0 style to the DOM. Without this deferral the
        // browser can batch the insertion and the style mutation into a single compositing step,
        // skipping the CSS transition entirely and making the label appear instantly instead of
        // fading in.
        requestAnimationFrame(() => {
            element.style.opacity = "1"
        })
    }
}
