const PAN_KEY = " "
const TYPED_INTO = "input, textarea, select"
export const PANNING_ATTRIBUTE = "data-panning"

/** While the space bar is held with the pointer over the graph, a drag pans it from anywhere, also from a box
 * that a drag would otherwise move. */
export class PanKey {
    private container?: HTMLElement
    private isPointerOver = false
    private held = false

    get isHeld(): boolean {
        return this.held
    }

    listenOver(container: HTMLElement): void {
        this.container = container
        container.addEventListener("mouseenter", this.notePointerEntered)
        container.addEventListener("mouseleave", this.notePointerLeft)
        window.addEventListener("keydown", this.press)
        window.addEventListener("keyup", this.release)
        window.addEventListener("blur", this.letGo)
    }

    stopListening(): void {
        this.letGo()
        this.container?.removeEventListener("mouseenter", this.notePointerEntered)
        this.container?.removeEventListener("mouseleave", this.notePointerLeft)
        window.removeEventListener("keydown", this.press)
        window.removeEventListener("keyup", this.release)
        window.removeEventListener("blur", this.letGo)
        this.container = undefined
        this.isPointerOver = false
    }

    private readonly notePointerEntered = (): void => {
        this.isPointerOver = true
    }

    private readonly notePointerLeft = (): void => {
        this.isPointerOver = false
    }

    private readonly press = (event: KeyboardEvent): void => {
        if (event.key !== PAN_KEY) {
            return
        }
        if (this.held) {
            event.preventDefault()
            return
        }
        // A space another handler took, as the one that opens a box from the keyboard, is not a pan.
        if (!this.isPointerOver || event.defaultPrevented || isTypedInto(event.target)) {
            return
        }
        event.preventDefault()
        this.held = true
        this.container?.setAttribute(PANNING_ATTRIBUTE, "")
    }

    // Releasing the space bar would otherwise click the button that has the focus.
    private readonly release = (event: KeyboardEvent): void => {
        if (event.key === PAN_KEY && this.held) {
            event.preventDefault()
            this.letGo()
        }
    }

    private readonly letGo = (): void => {
        this.held = false
        this.container?.removeAttribute(PANNING_ATTRIBUTE)
    }
}

function isTypedInto(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && (target.isContentEditable || target.matches(TYPED_INTO))
}
