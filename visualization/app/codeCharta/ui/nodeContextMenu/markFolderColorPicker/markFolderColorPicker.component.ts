import { Component, HostListener, Input, ViewChild } from "@angular/core"
import { MatMenuTrigger } from "@angular/material/menu"

import "./markFolderColorPicker.component.scss"

@Component({
	selector: "cc-mark-folder-color-picker",
	template: require("./markFolderColorPicker.component.html")
})
export class MarkFolderColorPickerComponent {
	@Input() markFolder: (hexColor: string) => void

	@ViewChild("colorPickerMenuTrigger") colorPickerMenuTrigger: MatMenuTrigger

	private isClickInside = false

	@HostListener("click")
	onClick() {
		this.isClickInside = true
	}

	@HostListener("document:click")
	handleDocumentClick() {
		if (!this.isClickInside && this.colorPickerMenuTrigger && this.colorPickerMenuTrigger.menuOpen) {
			this.colorPickerMenuTrigger.closeMenu()
		}

		this.isClickInside = false
	}
}
