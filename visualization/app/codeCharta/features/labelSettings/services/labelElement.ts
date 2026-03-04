import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import { BASE_OFFSET_PX } from "./label.constants"

export class LabelElement {
    readonly cssObject: CSS2DObject
    private readonly content: HTMLDivElement
    private badge: HTMLDivElement | null = null

    constructor(nameText: string, metricText: string) {
        const wrapper = document.createElement("div")
        this.content = document.createElement("div")
        this.content.style.cssText = LabelElement.buildContentStyles()

        if (nameText) {
            const nameSpan = document.createElement("span")
            nameSpan.style.cssText = "display: block; font-weight: 500;"
            nameSpan.textContent = nameText
            this.content.appendChild(nameSpan)
        }

        if (metricText) {
            const metricSpan = document.createElement("span")
            metricSpan.style.cssText = "display: block; font-size: 10px; color: #666; margin-top: 1px;"
            metricSpan.textContent = metricText
            this.content.appendChild(metricSpan)
        }

        wrapper.appendChild(this.content)
        this.cssObject = new CSS2DObject(wrapper)
        this.cssObject.center.set(0.5, 1)
    }

    getContentRect(): DOMRect {
        return this.content.getBoundingClientRect()
    }

    getContentElement(): HTMLDivElement {
        return this.content
    }

    setOpacity(value: string) {
        this.content.style.opacity = value
    }

    setTransform(offset: number) {
        this.content.style.transform = `translateY(${BASE_OFFSET_PX + offset}px)`
    }

    setTransition(value: string) {
        this.content.style.transition = value
    }

    setBadge(hiddenCount: number) {
        this.clearBadge()
        this.badge = document.createElement("div")
        this.badge.textContent = `+${hiddenCount} more`
        this.badge.style.cssText = `
            font-size: 10px;
            color: #888;
            margin-top: 2px;
            text-align: center;
            pointer-events: none;
        `
        this.content.appendChild(this.badge)
    }

    clearBadge() {
        if (this.badge) {
            this.badge.remove()
            this.badge = null
        }
    }

    private static buildContentStyles(): string {
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
            transform: translateY(${BASE_OFFSET_PX}px);
            opacity: 0;
            transition: opacity 0.2s ease-out;
        `
    }
}
