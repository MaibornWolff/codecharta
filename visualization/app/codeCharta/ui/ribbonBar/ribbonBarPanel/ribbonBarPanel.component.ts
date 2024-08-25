import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChild, ElementRef, HostBinding, Input, OnDestroy, ViewChild } from "@angular/core"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettingsComponent"

@Component({
    selector: "cc-ribbon-bar-panel",
    templateUrl: "./ribbonBarPanel.component.html",
    styleUrl: "./ribbonBarPanel.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RibbonBarPanelComponent implements AfterViewInit, OnDestroy {
    @Input() title?: string

    @HostBinding("class.separator")
    @Input()
    separator = false

    @ContentChild(RibbonBarPanelSettingsComponent, {
        read: ElementRef<HTMLElement>
    })
    settingsRef?: ElementRef<HTMLElement>

    @ViewChild('toggle')
    toggleSettingsRef!: ElementRef<HTMLElement>;

    @HostBinding("class.expanded")
    expanded = false

    @HostBinding("class.expandable")
    get hasSettings () {
        return Boolean(this.settingsRef)
    }

    mouseDownListener?: (event: MouseEvent) => void

    ngAfterViewInit(): void {
        this.mouseDownListener = (event: MouseEvent) =>  this.collapseOnOutsideClick(event);
        document.addEventListener("mousedown", this.mouseDownListener)
    }
    ngOnDestroy(): void {
        if (this.mouseDownListener) {
            document.removeEventListener("mousedown", this.mouseDownListener)
        }
    }

    toggleSettings() {
        this.expanded = !this.expanded;
    }

    private collapseOnOutsideClick(event: MouseEvent) {
        const clickedSettingsElement = this.settingsRef?.nativeElement?.contains(event.target as Node);
        const clickedSettingsToggleElement = this.toggleSettingsRef?.nativeElement.contains(event.target as Node);
        
        if (!clickedSettingsElement && !clickedSettingsToggleElement) {
            this.expanded = false
        }
    }
}
