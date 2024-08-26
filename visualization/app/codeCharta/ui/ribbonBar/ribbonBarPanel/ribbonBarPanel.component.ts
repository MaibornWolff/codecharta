import {
    AfterViewInit,
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    ViewChild
} from "@angular/core"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettings.component"

@Component({
    selector: "cc-ribbon-bar-panel",
    templateUrl: "./ribbonBarPanel.component.html",
    styleUrl: "./ribbonBarPanel.component.scss",
})
export class RibbonBarPanelComponent implements AfterViewInit, OnDestroy {
    @Input() title?: string

    @HostBinding("class.separator")
    @Input()
    separator = false

    @ContentChild(RibbonBarPanelSettingsComponent, {
        read: ElementRef<HTMLElement>
    })
    private settingsRef?: ElementRef<HTMLElement>

    @ViewChild("toggle")
    private toggleSettingsRef!: ElementRef<HTMLElement>

    @HostBinding("class.expanded")
    expanded = false

    @HostBinding("class.expandable")
    get hasSettings() {
        return Boolean(this.settingsRef)
    }

    private mouseDownListener?: (event: MouseEvent) => void

    ngAfterViewInit(): void {
        this.mouseDownListener = (event: MouseEvent) => this.collapseOnOutsideClick(event)
        document.addEventListener("mousedown", this.mouseDownListener)
    }
    ngOnDestroy(): void {
        if (this.mouseDownListener) {
            document.removeEventListener("mousedown", this.mouseDownListener)
        }
    }

    toggleSettings() {
        this.expanded = !this.expanded
    }

    private collapseOnOutsideClick(event: MouseEvent) {
        const target = event.target as Node

        const clickedSettingsElement = this.settingsRef?.nativeElement?.contains(target) ?? false
        const clickedSettingsToggleElement = this.toggleSettingsRef.nativeElement.contains(target)

        if (!clickedSettingsElement && !clickedSettingsToggleElement) {
            this.expanded = false
        }
    }
}
