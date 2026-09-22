export const resizeObserverDisconnect = jest.fn()

let latestResizeCallback: () => void = () => {}

class ResizeObserverStub {
    constructor(callback: () => void) {
        latestResizeCallback = callback
    }

    observe() {
        // a resize is reported only when a test asks for one, through reportResize
    }

    disconnect() {
        resizeObserverDisconnect()
    }
}

export function stubResizeObserver(): void {
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

export function reportResize(): void {
    latestResizeCallback()
}

export function elementOfSize(width: number, height: number): HTMLElement {
    const element = document.createElement("div")
    Object.defineProperty(element, "clientWidth", { value: width, configurable: true })
    Object.defineProperty(element, "clientHeight", { value: height, configurable: true })
    return element
}

/** Sizes every element, for components that measure a container they create themselves. */
export function stubElementSize(size: () => { width: number; height: number }): () => void {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => size().width })
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => size().height })
    return () => {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
    }
}
