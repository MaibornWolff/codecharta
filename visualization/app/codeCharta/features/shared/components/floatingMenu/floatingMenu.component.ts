import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, effect, inject, input, output, signal } from "@angular/core"

const VIEWPORT_MARGIN = 4

export interface FloatingMenuAnchor {
    x: number
    y: number
}

@Component({
    selector: "cc-floating-menu",
    template: "<ng-content></ng-content>",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "fixed z-[100] block rounded-box border border-base-300 bg-base-100 py-1 text-base-content shadow-lg",
        "[style.left.px]": "position().left",
        "[style.top.px]": "position().top",
        "[style.visibility]": "isMeasured() ? 'visible' : 'hidden'",
        "(contextmenu)": "$event.preventDefault()",
        "(document:pointerdown)": "dismissWhenOutside($event)",
        "(document:wheel)": "dismissWhenOutside($event)",
        "(window:resize)": "dismissWhenOnScreen()"
    }
})
export class FloatingMenuComponent {
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef)

    readonly anchor = input.required<FloatingMenuAnchor>()
    readonly dismissed = output<void>()

    private readonly clampedPosition = signal<{ left: number; top: number } | null>(null)
    private clampAnimationFrameId: number | null = null

    protected readonly isMeasured = computed(() => this.clampedPosition() !== null)
    protected readonly position = computed(() => this.clampedPosition() ?? { left: this.anchor().x, top: this.anchor().y })

    constructor() {
        effect(() => this.clampOnceTheMenuIsRendered(this.anchor()))
        inject(DestroyRef).onDestroy(() => this.cancelPendingClamp())
    }

    protected dismissWhenOutside(event: Event): void {
        if (this.isOffScreen() || (event.target instanceof Node && this.hostElement.nativeElement.contains(event.target))) {
            return
        }
        this.dismissed.emit()
    }

    protected dismissWhenOnScreen(): void {
        if (this.isOffScreen()) {
            return
        }
        this.dismissed.emit()
    }

    /** A view the router keeps alive off screen holds on to whatever it had rendered, this menu
     * included. Its document listeners still run, and every pointer event is "outside" an element
     * nobody can see — so without this it would dismiss the menu of the view that is on screen. */
    private isOffScreen(): boolean {
        return !this.hostElement.nativeElement.isConnected
    }

    private clampOnceTheMenuIsRendered(anchor: FloatingMenuAnchor): void {
        this.clampedPosition.set(null)
        // a pending measurement from a previous anchor would clamp the menu to stale coordinates
        this.cancelPendingClamp()
        this.clampAnimationFrameId = requestAnimationFrame(() => {
            this.clampAnimationFrameId = null
            this.clampToViewport(anchor)
        })
    }

    private clampToViewport({ x, y }: FloatingMenuAnchor): void {
        const { width, height } = this.hostElement.nativeElement.getBoundingClientRect()
        this.clampedPosition.set({
            left: Math.max(VIEWPORT_MARGIN, Math.min(x, window.innerWidth - width - VIEWPORT_MARGIN)),
            top: Math.max(VIEWPORT_MARGIN, Math.min(y, window.innerHeight - height - VIEWPORT_MARGIN))
        })
    }

    private cancelPendingClamp(): void {
        if (this.clampAnimationFrameId !== null) {
            cancelAnimationFrame(this.clampAnimationFrameId)
            this.clampAnimationFrameId = null
        }
    }
}
