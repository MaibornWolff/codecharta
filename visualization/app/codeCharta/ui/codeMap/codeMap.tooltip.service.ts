import { Injectable } from "@angular/core"
import { Node, CcState } from "../../codeCharta.model"
import { State } from "@ngrx/store"

@Injectable({ providedIn: "root" })
export class CodeMapTooltipService {
    private static readonly CURSOR_OFFSET_X = 12
    private static readonly CURSOR_OFFSET_Y = 12
    private static readonly VIEWPORT_PADDING = 8
    private static readonly TOOLTIP_STYLE = `
        position: fixed;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.97);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border-radius: 6px;
        padding: 6px 10px;
        font-family: Roboto, 'Helvetica Neue', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #1a1a1a;
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        border: 1px solid #000;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transition: opacity 0.1s ease-out;
    `

    private tooltipElement: HTMLDivElement | null = null
    private visible = false
    private currentNodeId: number | null = null

    constructor(private readonly state: State<CcState>) {}

    show(node: Node, clientX: number, clientY: number) {
        if (!this.tooltipElement) {
            this.createTooltipElement()
        }

        this.populateTooltip(node)
        this.positionTooltip(clientX, clientY)
        this.tooltipElement.style.opacity = "1"
        this.visible = true
        this.currentNodeId = node.id
    }

    updatePosition(clientX: number, clientY: number) {
        if (this.visible && this.tooltipElement) {
            this.positionTooltip(clientX, clientY)
        }
    }

    hide() {
        if (this.tooltipElement) {
            this.tooltipElement.style.opacity = "0"
        }
        this.visible = false
        this.currentNodeId = null
    }

    isVisible(): boolean {
        return this.visible
    }

    getCurrentNodeId(): number | null {
        return this.currentNodeId
    }

    getRect(): DOMRect | null {
        if (!this.visible || !this.tooltipElement) {
            return null
        }
        return this.tooltipElement.getBoundingClientRect()
    }

    dispose() {
        this.tooltipElement?.remove()
        this.tooltipElement = null
        this.visible = false
        this.currentNodeId = null
    }

    private createTooltipElement() {
        this.tooltipElement = document.createElement("div")
        this.tooltipElement.id = "cc-hover-tooltip"
        this.tooltipElement.style.cssText = CodeMapTooltipService.TOOLTIP_STYLE
        document.body.appendChild(this.tooltipElement)
    }

    private populateTooltip(node: Node) {
        const { dynamicSettings } = this.state.getValue()
        const { areaMetric, heightMetric, colorMetric } = dynamicSettings

        const metrics = [
            { label: areaMetric, value: node.attributes[areaMetric] },
            { label: heightMetric, value: node.attributes[heightMetric] },
            { label: colorMetric, value: node.attributes[colorMetric] }
        ]

        this.tooltipElement.textContent = ""

        const nameDiv = document.createElement("div")
        nameDiv.style.cssText = "font-weight: 500; margin-bottom: 2px;"
        nameDiv.textContent = node.name
        this.tooltipElement.append(nameDiv)

        for (const metric of metrics) {
            const metricDiv = document.createElement("div")
            metricDiv.style.cssText = "font-size: 10px; color: #666;"
            metricDiv.textContent = `${metric.label}: ${metric.value ?? "\u2014"}`
            this.tooltipElement.append(metricDiv)
        }
    }

    private positionTooltip(clientX: number, clientY: number) {
        let x = clientX + CodeMapTooltipService.CURSOR_OFFSET_X
        let y = clientY + CodeMapTooltipService.CURSOR_OFFSET_Y

        const rect = this.tooltipElement.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        if (x + rect.width > viewportWidth - CodeMapTooltipService.VIEWPORT_PADDING) {
            x = clientX - rect.width - CodeMapTooltipService.CURSOR_OFFSET_X
        }
        if (y + rect.height > viewportHeight - CodeMapTooltipService.VIEWPORT_PADDING) {
            y = clientY - rect.height - CodeMapTooltipService.CURSOR_OFFSET_Y
        }

        if (x < CodeMapTooltipService.VIEWPORT_PADDING) {
            x = CodeMapTooltipService.VIEWPORT_PADDING
        }
        if (y < CodeMapTooltipService.VIEWPORT_PADDING) {
            y = CodeMapTooltipService.VIEWPORT_PADDING
        }

        this.tooltipElement.style.left = `${x}px`
        this.tooltipElement.style.top = `${y}px`
    }
}
