import { Injectable } from "@angular/core"

interface HoverTooltipRow {
    label: string
    value: string
}

/** A title line plus any number of muted label/value rows. */
export interface HoverTooltipContent {
    title: string
    rows: HoverTooltipRow[]
}

const CURSOR_OFFSET_X = 12
const CURSOR_OFFSET_Y = 12
const VIEWPORT_PADDING = 8

// Themed via the daisyUI custom properties rather than literal colours, so the tooltip follows the
// active theme. It is appended to document.body (it must escape the explorer's overflow clipping),
// which puts it outside every component's style scope — hence inline styles rather than a class.
const TOOLTIP_STYLE = `
    position: fixed;
    z-index: 1000;
    background: color-mix(in srgb, var(--color-base-100) 97%, transparent);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 6px;
    padding: 6px 10px;
    font-family: Roboto, 'Helvetica Neue', sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: var(--color-base-content);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    border: 1px solid var(--color-base-300);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: opacity 0.1s ease-out;
`

/**
 * The single floating hover tooltip, shared by everything that needs one (the 3D map's buildings and
 * the explorer's rows). It renders whatever title/rows it is handed and knows nothing about metrics,
 * domain words or any other content — callers compose the content.
 */
@Injectable({ providedIn: "root" })
export class HoverTooltipService {
    private tooltipElement: HTMLDivElement | null = null
    private visible = false

    show(content: HoverTooltipContent, clientX: number, clientY: number) {
        if (!this.tooltipElement) {
            this.createTooltipElement()
        }

        this.populate(content)
        this.position(clientX, clientY)
        this.tooltipElement.style.opacity = "1"
        this.visible = true
    }

    updatePosition(clientX: number, clientY: number) {
        if (this.visible && this.tooltipElement) {
            this.position(clientX, clientY)
        }
    }

    hide() {
        if (this.tooltipElement) {
            this.tooltipElement.style.opacity = "0"
        }
        this.visible = false
    }

    isVisible(): boolean {
        return this.visible
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
    }

    private createTooltipElement() {
        this.tooltipElement = document.createElement("div")
        this.tooltipElement.id = "cc-hover-tooltip"
        this.tooltipElement.style.cssText = TOOLTIP_STYLE
        document.body.appendChild(this.tooltipElement)
    }

    private populate(content: HoverTooltipContent) {
        this.tooltipElement.textContent = ""

        const titleElement = document.createElement("div")
        titleElement.style.cssText = "font-weight: 600; margin-bottom: 2px;"
        titleElement.textContent = content.title
        this.tooltipElement.append(titleElement)

        for (const row of content.rows) {
            const rowElement = document.createElement("div")
            rowElement.style.cssText = "font-size: 10px; opacity: 0.7;"
            rowElement.textContent = `${row.label}: ${row.value}`
            this.tooltipElement.append(rowElement)
        }
    }

    private position(clientX: number, clientY: number) {
        let x = clientX + CURSOR_OFFSET_X
        let y = clientY + CURSOR_OFFSET_Y

        const rect = this.tooltipElement.getBoundingClientRect()

        if (x + rect.width > window.innerWidth - VIEWPORT_PADDING) {
            x = clientX - rect.width - CURSOR_OFFSET_X
        }
        if (y + rect.height > window.innerHeight - VIEWPORT_PADDING) {
            y = clientY - rect.height - CURSOR_OFFSET_Y
        }

        this.tooltipElement.style.left = `${Math.max(x, VIEWPORT_PADDING)}px`
        this.tooltipElement.style.top = `${Math.max(y, VIEWPORT_PADDING)}px`
    }
}
