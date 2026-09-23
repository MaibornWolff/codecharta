import { signal } from "@angular/core"

interface ContainerSize {
    width: number
    height: number
}

export class ContainerSizeObserver {
    private readonly measuredSize = signal<ContainerSize>(
        { width: 0, height: 0 },
        { equal: (previous, next) => previous.width === next.width && previous.height === next.height }
    )
    private resizeObserver?: ResizeObserver

    readonly size = this.measuredSize.asReadonly()

    observe(container: HTMLElement): void {
        this.disconnect()
        this.measure(container)
        this.resizeObserver = new ResizeObserver(() => this.measure(container))
        this.resizeObserver.observe(container)
    }

    disconnect(): void {
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
    }

    private measure(container: HTMLElement): void {
        this.measuredSize.set({ width: container.clientWidth, height: container.clientHeight })
    }
}
