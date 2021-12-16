import "./labelledColorPicker.component.scss"
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core"
import { MatMenuTrigger } from "@angular/material/menu"

@Component({
	selector: "cc-labelled-color-picker",
	template: require("./labelledColorPicker.component.html")
})
export class LabelledColorPickerComponent {
	@Input() hexColor: string
	@Input() labels: string[]

	@Output() onColorChange = new EventEmitter<string>()

	@ViewChild("colorPickerMenuTrigger") colorPickerMenuTrigger: MatMenuTrigger
	@ViewChild("brush") brush: ElementRef

	private isClickInside = false

	@HostListener("mouseenter") onMouseEnter() {
		this.brush.nativeElement.style.opacity = "1"
	}

	@HostListener("mouseleave") onMouseLeave() {
		if (!this.colorPickerMenuTrigger.menuOpen) this.brush.nativeElement.style.opacity = "0"
	}

	@HostListener("click")
	onClick() {
		this.isClickInside = true

		const menuOpenedSubscription = this.colorPickerMenuTrigger.menuOpened.subscribe(() => {
			this.brush.nativeElement.style.opacity = "1"
			menuOpenedSubscription.unsubscribe()
		})
		const menuClosedSubscription = this.colorPickerMenuTrigger.menuClosed.subscribe(() => {
			this.brush.nativeElement.style.opacity = "0"
			menuClosedSubscription.unsubscribe()
		})

		this.colorPickerMenuTrigger.openMenu()
	}

	@HostListener("document:click")
	handleDocumentClick() {
		if (!this.isClickInside && this.colorPickerMenuTrigger && this.colorPickerMenuTrigger.menuOpen) {
			this.colorPickerMenuTrigger.closeMenu()
		}

		this.isClickInside = false
	}

	handleColorChange(hexColor: string) {
		this.onColorChange.emit(hexColor)
	}
}
