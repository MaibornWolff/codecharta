import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { switchMap } from "rxjs"
import { ExtensionRulesService } from "../../services/extensionRules.service"

const MENU_WIDTH_PX = 192
const VIEWPORT_MARGIN_PX = 4

export interface MenuPosition {
    left: number
    bottom: number
}

export interface ExtensionMenuRequest {
    fileExtension: string
    position: MenuPosition
}

export function menuPositionAt(event: MouseEvent): MenuPosition {
    const left = Math.max(VIEWPORT_MARGIN_PX, Math.min(event.clientX, window.innerWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX))
    const bottom = Math.max(VIEWPORT_MARGIN_PX, window.innerHeight - event.clientY)
    return { left, bottom }
}

@Component({
    selector: "cc-file-extension-menu",
    templateUrl: "./fileExtensionMenu.component.html",
    host: {
        class: "fixed z-[100] block w-48 rounded-box border border-base-300 bg-base-100 py-1 text-base-content shadow-lg",
        "[style.left.px]": "position().left",
        "[style.bottom.px]": "position().bottom",
        "(contextmenu)": "$event.preventDefault()"
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionMenuComponent {
    private readonly extensionRulesService = inject(ExtensionRulesService)
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef)

    readonly fileExtension = input.required<string>()
    readonly position = input.required<MenuPosition>()
    readonly closed = output<void>()

    readonly isFlattened = toSignal(
        toObservable(this.fileExtension).pipe(
            switchMap(fileExtension => this.extensionRulesService.getIsFlattenedByFileExtension(fileExtension))
        ),
        { initialValue: false }
    )

    @HostListener("document:pointerdown", ["$event"])
    onDocumentPointerDown(event: Event) {
        if (event.target instanceof Node && this.elementRef.nativeElement.contains(event.target)) {
            return
        }
        this.closed.emit()
    }

    @HostListener("document:wheel")
    @HostListener("window:resize")
    onViewportChange() {
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
