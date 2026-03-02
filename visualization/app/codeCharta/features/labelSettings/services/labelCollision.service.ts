import { Injectable } from "@angular/core"
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, Vector3 } from "three"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { CodeMapTooltipService } from "../../../ui/codeMap/codeMap.tooltip.service"
import { LabelCreationService, InternalLabel } from "./labelCreation.service"
import { LabelMode } from "../../../codeCharta.model"
import { StateAccessStore } from "../stores/stateAccess.store"

interface LabelLayoutInfo {
    label: InternalLabel
    content: HTMLDivElement
    rect: DOMRect
    offset: number
    hidden: boolean
}

@Injectable({ providedIn: "root" })
export class LabelCollisionService {
    private static readonly LABEL_GAP_PX = 4
    private static readonly BASE_OFFSET_PX = -20
    private static readonly MIN_CONNECTOR_DISTANCE = 0.5
    private static readonly MAX_DISPLACEMENT_PX = 100
    private static readonly MAX_CONNECTORS = 200

    private connectorSegments: LineSegments | null = null
    private connectorPositions: Float32Array | null = null
    private connectorsDirty = true
    private readonly projectionVec = new Vector3()
    private _suppressLayout = false
    private badges: HTMLDivElement[] = []

    constructor(
        private readonly threeRendererService: ThreeRendererService,
        private readonly threeSceneService: ThreeSceneService,
        private readonly tooltipService: CodeMapTooltipService,
        private readonly labelCreationService: LabelCreationService,
        private readonly stateAccessStore: StateAccessStore
    ) {
        this.threeRendererService.afterRender$.subscribe(() => this.updateLabelLayout())
    }

    setSuppressLayout(suppress: boolean) {
        this._suppressLayout = suppress
    }

    updateLabelLayout() {
        const labels = this.labelCreationService.getLabels()
        if (this._suppressLayout || labels.length === 0) {
            this.clearConnectors()
            this.clearBadges()
            return
        }

        this.clearBadges()
        const infos = this.collectLabelInfos(labels)
        const tooltipRect = this.tooltipService.getRect()
        this.resolveCollisions(infos)
        this.resolveTooltipCollisions(infos, tooltipRect)
        this.applyCollisionOffsets(infos)
        this.drawConnectors(infos)

        if (this.connectorsDirty) {
            this.connectorsDirty = false
            this.threeRendererService.render()
        }
    }

    clearConnectors() {
        if (this.connectorSegments) {
            this.connectorSegments.geometry.setDrawRange(0, 0)
        }
        this.connectorsDirty = true
    }

    destroy() {
        this.labelCreationService.clearLabels()
        this.clearBadges()
        if (this.connectorSegments) {
            this.connectorSegments.geometry.dispose()
            ;(this.connectorSegments.material as LineBasicMaterial).dispose()
            this.threeSceneService.scene.remove(this.connectorSegments)
            this.connectorSegments = null
            this.connectorPositions = null
        }
    }

    private clearBadges() {
        for (const badge of this.badges) {
            badge.remove()
        }
        this.badges = []
    }

    private initConnectors() {
        const maxVertices = LabelCollisionService.MAX_CONNECTORS * 2
        this.connectorPositions = new Float32Array(maxVertices * 3)
        const geometry = new BufferGeometry()
        geometry.setAttribute("position", new BufferAttribute(this.connectorPositions, 3))
        geometry.setDrawRange(0, 0)

        const material = new LineBasicMaterial({
            color: 0xb4_b4_b4,
            transparent: true,
            opacity: 0.9,
            depthTest: true
        })

        this.connectorSegments = new LineSegments(geometry, material)
        this.connectorSegments.frustumCulled = false
        this.threeSceneService.scene.add(this.connectorSegments)
    }

    private collectLabelInfos(labels: InternalLabel[]): LabelLayoutInfo[] {
        const infos: LabelLayoutInfo[] = []

        for (const label of labels) {
            const content = label.cssObject.element.firstElementChild as HTMLDivElement
            if (!content) {
                continue
            }
            const domRect = content.getBoundingClientRect()
            const baseRect = {
                top: domRect.top - label.appliedOffset,
                bottom: domRect.bottom - label.appliedOffset,
                left: domRect.left,
                right: domRect.right,
                width: domRect.width,
                height: domRect.height,
                x: domRect.x,
                y: domRect.y - label.appliedOffset
            } as DOMRect
            infos.push({ label, content, rect: baseRect, offset: 0, hidden: false })
        }

        return infos
    }

    private resolveCollisions(infos: LabelLayoutInfo[]) {
        const { appSettings } = this.stateAccessStore.getValue()
        if (!appSettings.groupLabelCollisions) {
            return
        }

        const suppressedLabel = this.labelCreationService.getSuppressedLabel()
        const activeInfos = infos.filter(info => info.label !== suppressedLabel)
        if (activeInfos.length === 0) {
            return
        }

        const groups = this.buildCollisionGroups(activeInfos)
        const { dynamicSettings } = this.stateAccessStore.getValue()
        const metric = appSettings.labelMode === LabelMode.Color ? dynamicSettings.colorMetric : dynamicSettings.heightMetric

        for (const group of groups) {
            if (group.length <= 1) {
                continue
            }

            const winner = this.pickGroupWinner(group, metric)

            for (const info of group) {
                if (info !== winner) {
                    info.hidden = true
                }
            }

            this.createBadge(winner, group.length - 1)
        }
    }

    private buildCollisionGroups(infos: LabelLayoutInfo[]): LabelLayoutInfo[][] {
        const n = infos.length
        const parent = Array.from({ length: n }, (_, i) => i)

        const find = (x: number): number => {
            while (parent[x] !== x) {
                parent[x] = parent[parent[x]]
                x = parent[x]
            }
            return x
        }

        const union = (a: number, b: number) => {
            const rootA = find(a)
            const rootB = find(b)
            if (rootA !== rootB) {
                parent[rootA] = rootB
            }
        }

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (this.rectsOverlap(infos[i].rect, infos[j].rect)) {
                    union(i, j)
                }
            }
        }

        const groups = new Map<number, LabelLayoutInfo[]>()
        for (let i = 0; i < n; i++) {
            const root = find(i)
            if (!groups.has(root)) {
                groups.set(root, [])
            }
            groups.get(root).push(infos[i])
        }

        return [...groups.values()]
    }

    private rectsOverlap(a: DOMRect, b: DOMRect): boolean {
        return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom
    }

    private pickGroupWinner(group: LabelLayoutInfo[], metric: string): LabelLayoutInfo {
        let winner = group[0]
        let maxValue = winner.label.node.attributes[metric] ?? 0

        for (let i = 1; i < group.length; i++) {
            const value = group[i].label.node.attributes[metric] ?? 0
            if (value > maxValue || (value === maxValue && group[i].label.node.path < winner.label.node.path)) {
                maxValue = value
                winner = group[i]
            }
        }

        return winner
    }

    private createBadge(winner: LabelLayoutInfo, hiddenCount: number) {
        const badge = document.createElement("div")
        badge.textContent = `+${hiddenCount} more`
        badge.style.cssText = `
            font-size: 10px;
            color: #888;
            margin-top: 2px;
            text-align: center;
            pointer-events: none;
        `

        winner.content.appendChild(badge)
        this.badges.push(badge)
    }

    private resolveTooltipCollisions(infos: LabelLayoutInfo[], tooltipRect: DOMRect | null) {
        if (!tooltipRect) {
            return
        }

        const suppressedLabel = this.labelCreationService.getSuppressedLabel()

        for (const current of infos) {
            if (current.hidden || current.label === suppressedLabel) {
                continue
            }

            const currentTop = current.rect.top + current.offset
            const currentBottom = current.rect.bottom + current.offset
            const horizontalOverlap = current.rect.right > tooltipRect.left && current.rect.left < tooltipRect.right
            const verticalOverlap = currentBottom > tooltipRect.top && currentTop < tooltipRect.bottom

            if (horizontalOverlap && verticalOverlap) {
                const overlap = tooltipRect.bottom + LabelCollisionService.LABEL_GAP_PX - currentTop
                if (overlap > 0) {
                    current.offset += overlap
                }
            }
        }
    }

    private applyCollisionOffsets(infos: LabelLayoutInfo[]) {
        const suppressedLabel = this.labelCreationService.getSuppressedLabel()

        for (const info of infos) {
            const content = info.content
            const isSuppressed = info.label === suppressedLabel

            if (info.hidden) {
                content.style.opacity = "0"
                content.style.transform = `translateY(${LabelCollisionService.BASE_OFFSET_PX}px)`
                info.label.appliedOffset = 0
            } else if (info.offset > LabelCollisionService.MAX_DISPLACEMENT_PX) {
                content.style.opacity = "0"
                content.style.transform = `translateY(${LabelCollisionService.BASE_OFFSET_PX}px)`
                info.label.appliedOffset = 0
            } else {
                content.style.opacity = isSuppressed ? "0" : "1"
                content.style.transform = `translateY(${LabelCollisionService.BASE_OFFSET_PX + info.offset}px)`
                info.label.appliedOffset = info.offset
            }
        }
    }

    private drawConnectors(infos: LabelLayoutInfo[]) {
        if (!this.connectorSegments) {
            this.initConnectors()
        }

        const camera = this.threeRendererService.camera
        if (!camera) {
            return
        }

        const container = this.threeRendererService.labelRenderer?.domElement
        const viewportH = container ? container.clientHeight : window.innerHeight

        const positions = this.connectorPositions
        let vertexIndex = 0
        const suppressedLabel = this.labelCreationService.getSuppressedLabel()

        for (const info of infos) {
            if (info.hidden || info.offset > LabelCollisionService.MAX_DISPLACEMENT_PX || info.label === suppressedLabel) {
                continue
            }

            const buildingTop = info.label.buildingTop
            const labelPos = info.label.cssObject.position

            const dy = labelPos.y - buildingTop.y
            if (dy < LabelCollisionService.MIN_CONNECTOR_DISTANCE) {
                continue
            }

            if (vertexIndex >= LabelCollisionService.MAX_CONNECTORS * 2) {
                break
            }

            // Compute line endpoint at the label's visual bottom.
            // The CSS transform translateY(BASE_OFFSET_PX + offset) shifts the label
            // in screen space. Convert that shift to a world-space point by
            // projecting the anchor to NDC, adjusting Y, and unprojecting.
            this.projectionVec.copy(labelPos).project(camera)
            const cssOffsetPx = LabelCollisionService.BASE_OFFSET_PX + info.offset
            this.projectionVec.y -= (cssOffsetPx * 2) / viewportH
            this.projectionVec.unproject(camera)

            const vi = vertexIndex * 3
            positions[vi] = buildingTop.x
            positions[vi + 1] = buildingTop.y
            positions[vi + 2] = buildingTop.z
            vertexIndex++

            const vi2 = vertexIndex * 3
            positions[vi2] = this.projectionVec.x
            positions[vi2 + 1] = this.projectionVec.y
            positions[vi2 + 2] = this.projectionVec.z
            vertexIndex++
        }

        this.connectorSegments.geometry.setDrawRange(0, vertexIndex)
        ;(this.connectorSegments.geometry.attributes.position as BufferAttribute).needsUpdate = true
    }
}
