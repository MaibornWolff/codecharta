import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef
} from "@angular/core"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettings.component"

@Component({
    selector: "cc-ribbon-bar-panel",
    templateUrl: "./ribbonBarPanel.component.html"
})
export class RibbonBarPanelComponent implements OnInit, OnDestroy {
    @Input() title?: string
    @Input() collapseOnPanelClick = true

    @HostBinding("class.separator")
    @Input()
    separator = false

    @ContentChild(RibbonBarPanelSettingsComponent, {
        read: ElementRef<HTMLElement>
    })
    private readonly settingsRef?: ElementRef<HTMLElement>

    @ViewChild("toggle")
    private readonly toggleSettingsRef!: ElementRef<HTMLElement>

    @ViewChild("toggleHeader")
    private readonly toggleHeaderRef!: ElementRef<HTMLElement>

    private _isExpanded = false

    get isExpanded() {
        return this._isExpanded
    }

    set isExpanded(value: boolean) {
        this._isExpanded = value
    }

    @HostBinding("class.expanded")
    get expanded() {
        return this._isExpanded
    }

    @Input()
    isHeaderExpandable = false

    @Input()
    isPinned = false

    @HostBinding("class.expandable")
    get hasSettings() {
        return Boolean(this.settingsRef)
    }

    @Output()
    toggleSettingsChange = new EventEmitter<boolean>()

    private mouseDownListener?: (event: MouseEvent) => void

    constructor(private readonly viewReference: ViewContainerRef) {}

    ngOnInit(): void {
        this.mouseDownListener = (event: MouseEvent) => this.collapseOnOutsideClick(event)
        document.addEventListener("mousedown", this.mouseDownListener)
    }

    ngOnDestroy(): void {
        if (this.mouseDownListener) {
            document.removeEventListener("mousedown", this.mouseDownListener)
        }
    }

    toggleSettings(event?: Event) {
        if (event instanceof KeyboardEvent && event.key === " ") {
            event.preventDefault()
        }
        this.isExpanded = !this.isExpanded
        this.toggleSettingsChange.emit(this.isExpanded)
    }

    private collapseOnOutsideClick(event: MouseEvent) {
        if (this.isPinned) {
            return
        }

        const target = event.target as Node

        const overlayPaneElement = document.querySelector(".cdk-overlay-container")

        const clickedPanel = this.viewReference.element.nativeElement.contains(target)
        const clickedWithinOverlayPane = overlayPaneElement ? overlayPaneElement.contains(target) : false
        const clickedSettingsElement = this.settingsRef?.nativeElement?.contains(target) ?? false
        const clickedSettingsToggleElement = this.toggleSettingsRef.nativeElement.contains(target)
        const clickedHeaderToggleElement = this.toggleHeaderRef?.nativeElement.contains(target) ?? false

        const shouldCollapse =
            !clickedWithinOverlayPane &&
            !clickedSettingsElement &&
            !clickedSettingsToggleElement &&
            !clickedHeaderToggleElement &&
            (!clickedPanel || this.collapseOnPanelClick)

        if (shouldCollapse) {
            this.isExpanded = false
        }
    }
}
