import { Injectable, inject } from "@angular/core"
import { KeyValuePair } from "../../model/codeCharta.model"
import { HoverTooltipContent, HoverTooltipService } from "../../util/hoverTooltip.service"
import { CodeMapTooltipStore } from "./stores/codeMapTooltip.store"

export interface TooltipNode {
    name: string
    id?: number
    attributes?: KeyValuePair
}

const MISSING_VALUE = "—"

/**
 * The 3D map's hover tooltip: the area/height/color metrics of the hovered building. Only the CONTENT
 * is map-specific — the floating element itself is the shared HoverTooltipService, so other views can
 * show their own content in the same tooltip without inheriting metrics semantics.
 */
@Injectable({ providedIn: "root" })
export class CodeMapTooltipService {
    private readonly hoverTooltipService = inject(HoverTooltipService)
    private currentNodeId: number | null = null

    constructor(private readonly codeMapTooltipStore: CodeMapTooltipStore) {}

    show(node: TooltipNode, clientX: number, clientY: number) {
        this.hoverTooltipService.show(this.buildContent(node), clientX, clientY)
        this.currentNodeId = node.id ?? null
    }

    updatePosition(clientX: number, clientY: number) {
        this.hoverTooltipService.updatePosition(clientX, clientY)
    }

    hide() {
        this.hoverTooltipService.hide()
        this.currentNodeId = null
    }

    isVisible(): boolean {
        return this.hoverTooltipService.isVisible()
    }

    getCurrentNodeId(): number | null {
        return this.currentNodeId
    }

    getRect(): DOMRect | null {
        return this.hoverTooltipService.getRect()
    }

    dispose() {
        this.hoverTooltipService.dispose()
        this.currentNodeId = null
    }

    private buildContent(node: TooltipNode): HoverTooltipContent {
        const { areaMetric, heightMetric, colorMetric } = this.codeMapTooltipStore.getSelectedMetrics()

        return {
            title: node.name,
            rows: [areaMetric, heightMetric, colorMetric].map(metric => ({
                label: metric,
                value: `${node.attributes?.[metric] ?? MISSING_VALUE}`
            }))
        }
    }
}
