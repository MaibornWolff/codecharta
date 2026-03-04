import { Injectable } from "@angular/core"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { CodeMapTooltipService } from "../../../ui/codeMap/codeMap.tooltip.service"
import { LabelCreationService, InternalLabel } from "./labelCreation.service"
import { LabelMode } from "../../../codeCharta.model"
import { StateAccessStore } from "../stores/stateAccess.store"
import { ConnectorDrawingService, LabelLayoutInfo } from "./connectorDrawing.service"
import { LABEL_GAP_PX, MAX_DISPLACEMENT_PX, TOOLTIP_COLLISION_PADDING_PX } from "./label.constants"

@Injectable({ providedIn: "root" })
export class LabelCollisionService {
    private _suppressLayout = false

    constructor(
        private readonly threeRendererService: ThreeRendererService,
        private readonly tooltipService: CodeMapTooltipService,
        private readonly labelCreationService: LabelCreationService,
        private readonly stateAccessStore: StateAccessStore,
        private readonly connectorDrawingService: ConnectorDrawingService
    ) {
        this.threeRendererService.afterRender$.subscribe(() => this.updateLabelLayout())
    }

    setSuppressLayout(suppress: boolean) {
        this._suppressLayout = suppress
    }

    updateLabelLayout() {
        const labels = this.labelCreationService.getLabels()
        if (this._suppressLayout || labels.length === 0) {
            this.connectorDrawingService.clearConnectors()
            this.clearBadges(labels)
            return
        }

        this.clearBadges(labels)
        const infos = this.collectLabelInfos(labels)
        const tooltipRect = this.tooltipService.getRect()
        this.resolveCollisions(infos)
        this.resolveTooltipCollisions(infos, tooltipRect)
        this.applyCollisionOffsets(infos)

        const suppressedLabel = this.labelCreationService.getSuppressedLabel()
        this.connectorDrawingService.drawConnectors(infos, suppressedLabel)

        if (this.connectorDrawingService.isDirty()) {
            this.connectorDrawingService.markClean()
            this.threeRendererService.render()
        }
    }

    destroy() {
        this.clearBadges(this.labelCreationService.getLabels())
        this.labelCreationService.clearLabels()
        this.connectorDrawingService.destroy()
    }

    private clearBadges(labels: InternalLabel[]) {
        for (const label of labels) {
            label.labelElement.clearBadge()
        }
    }

    private collectLabelInfos(labels: InternalLabel[]): LabelLayoutInfo[] {
        const infos: LabelLayoutInfo[] = []

        for (const label of labels) {
            const domRect = label.labelElement.getContentRect()
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
            infos.push({ label, rect: baseRect, offset: 0, hidden: false })
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

            winner.label.labelElement.setBadge(group.length - 1)
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

    private resolveTooltipCollisions(infos: LabelLayoutInfo[], tooltipRect: DOMRect | null) {
        if (!tooltipRect) {
            return
        }

        const pad = TOOLTIP_COLLISION_PADDING_PX
        const paddedLeft = tooltipRect.left - pad
        const paddedRight = tooltipRect.right + pad
        const paddedTop = tooltipRect.top - pad
        const paddedBottom = tooltipRect.bottom + pad

        const suppressedLabel = this.labelCreationService.getSuppressedLabel()

        for (const current of infos) {
            if (current.hidden || current.label === suppressedLabel) {
                continue
            }

            const currentTop = current.rect.top + current.offset
            const currentBottom = current.rect.bottom + current.offset
            const horizontalOverlap = current.rect.right > paddedLeft && current.rect.left < paddedRight
            const verticalOverlap = currentBottom > paddedTop && currentTop < paddedBottom

            if (horizontalOverlap && verticalOverlap) {
                const overlap = paddedBottom + LABEL_GAP_PX - currentTop
                if (overlap > 0) {
                    current.offset += overlap
                }
            }
        }
    }

    private applyCollisionOffsets(infos: LabelLayoutInfo[]) {
        const suppressedLabel = this.labelCreationService.getSuppressedLabel()

        for (const info of infos) {
            const labelElement = info.label.labelElement
            const isSuppressed = info.label === suppressedLabel

            if (info.hidden || info.offset > MAX_DISPLACEMENT_PX) {
                labelElement.setOpacity("0")
                labelElement.setTransform(0)
                info.label.appliedOffset = 0
            } else {
                labelElement.setOpacity(isSuppressed ? "0" : "1")
                labelElement.setTransform(info.offset)
                info.label.appliedOffset = info.offset
            }
        }
    }
}
