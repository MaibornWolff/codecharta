import { ChangeDetectionStrategy, Component, ElementRef, HostListener, input, output, viewChild } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { switchMap } from "rxjs"
import { ExtensionRulesService } from "../../services/extensionRules.service"

export interface ContextMenuPosition {
    left: number
    bottom: number
}

const MENU_WIDTH_PX = 192
const VIEWPORT_MARGIN_PX = 4

export function contextMenuPositionAt(event: MouseEvent): ContextMenuPosition {
    const left = Math.max(VIEWPORT_MARGIN_PX, Math.min(event.clientX, window.innerWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX))
    const bottom = Math.max(VIEWPORT_MARGIN_PX, window.innerHeight - event.clientY)
    return { left, bottom }
}

@Component({
    selector: "cc-file-extension-context-menu",
    templateUrl: "./fileExtensionContextMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionContextMenuComponent {
    fileExtension = input.required<string>()
    position = input.required<ContextMenuPosition>()
    closed = output<void>()

    private readonly menuRef = viewChild<ElementRef<HTMLElement>>("menu")

    readonly isFlattened = toSignal(
        toObservable(this.fileExtension).pipe(
            switchMap(fileExtension => this.extensionRulesService.getIsFlattenedByFileExtension(fileExtension))
        ),
        { initialValue: false }
    )

    constructor(private readonly extensionRulesService: ExtensionRulesService) {}

    @HostListener("document:pointerdown", ["$event"])
    onDocumentPointerDown(event: Event) {
        const menuElement = this.menuRef()?.nativeElement
        if (menuElement && event.target instanceof Node && menuElement.contains(event.target)) {
            return
        }
        this.closed.emit()
    }

    @HostListener("document:wheel")
    @HostListener("window:resize")
    closeOnViewportChange() {
        this.closed.emit()
    }

    flatten() {
        this.extensionRulesService.flatten(this.fileExtension())
        this.closed.emit()
    }

    exclude() {
        this.extensionRulesService.exclude(this.fileExtension())
        this.closed.emit()
    }

    show() {
        this.extensionRulesService.show(this.fileExtension())
        this.closed.emit()
    }
}
