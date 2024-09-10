import { Component, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild } from "@angular/core"
import { MatMenuTrigger, MenuPositionX } from "@angular/material/menu"

@Component({
    selector: "cc-color-picker",
    templateUrl: "./colorPicker.component.html"
})
export class ColorPickerComponent {
    @Input() hexColor: string
    @Input() openXPosition: MenuPositionX = "after"
    @Input() triggerTemplate: TemplateRef<unknown>

    @Output() onColorChange = new EventEmitter<string>()

    @ViewChild("colorPickerMenuTrigger") colorPickerMenuTrigger: MatMenuTrigger

    isHovered = false

    private isClickInside = false

    handleChangeComplete(hexColor: string) {
        this.onColorChange.emit(hexColor)
    }

    @HostListener("mouseenter") onMouseEnter() {
        this.isHovered = true
    }

    @HostListener("mouseleave") onMouseLeave() {
        this.isHovered = false
    }

    @HostListener("click") onClick() {
        this.isClickInside = true
        this.colorPickerMenuTrigger.openMenu()
    }

    @HostListener("document:click")
    handleDocumentClick() {
        if (!this.isClickInside && this.colorPickerMenuTrigger.menuOpen) {
            this.colorPickerMenuTrigger.closeMenu()
        }

        this.isClickInside = false
    }
}
