import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core"
import { canBeOpened, LayoutBox } from "../../util/layoutModel"
import { BoxKind } from "../../util/leveledTree"

const BOX_KIND_NAMES: Record<BoxKind, string> = { folder: "Folder", package: "Package", file: "File", declaration: "Declaration" }
const STEPS: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }

/** The graph is a canvas, which a keyboard and a screen reader cannot reach into: this list stands for its boxes.
 * It is one stop for the tab key, and the arrow keys move within it. */
@Component({
    selector: "cc-dependency-graph-box-list",
    templateUrl: "./dependencyGraphBoxList.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyGraphBoxListComponent {
    readonly boxes = input.required<readonly LayoutBox[]>()
    readonly selectedPath = input<string | null>(null)

    readonly boxClicked = output<string>()
    readonly boxToggled = output<string>()
    readonly boxFocused = output<string | null>()

    private readonly lastFocusedPath = signal<string | null>(null)

    protected readonly tabStop = computed(() => {
        const boxes = this.boxes()
        const isListed = (path: string | null) => path !== null && boxes.some(box => box.path === path)
        return [this.lastFocusedPath(), this.selectedPath()].find(isListed) ?? boxes[0]?.path ?? null
    })

    protected readonly canBeOpened = canBeOpened

    protected labelOf(box: LayoutBox): string {
        return `${BOX_KIND_NAMES[box.kind]} ${box.name}`
    }

    protected focus(path: string): void {
        this.lastFocusedPath.set(path)
        this.boxFocused.emit(path)
    }

    /** A button takes the space key as a click, which selects; here it opens and closes instead. */
    protected toggleFromKeyboard(event: Event, box: LayoutBox): void {
        event.preventDefault()
        if (canBeOpened(box)) {
            this.boxToggled.emit(box.path)
        }
    }

    protected moveFocus(event: KeyboardEvent): void {
        const buttons = [...(event.currentTarget as HTMLElement).querySelectorAll("button")]
        const next = buttons[buttons.indexOf(event.target as HTMLButtonElement) + (STEPS[event.key] ?? 0)]
        if (STEPS[event.key] !== undefined && next) {
            event.preventDefault()
            next.focus()
        }
    }
}
