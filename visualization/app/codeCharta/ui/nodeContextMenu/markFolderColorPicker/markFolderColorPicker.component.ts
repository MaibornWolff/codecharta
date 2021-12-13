import { Component, Input } from "@angular/core"

import "./markFolderColorPicker.component.scss"

@Component({
	selector: "cc-mark-folder-color-picker",
	template: require("./markFolderColorPicker.component.html")
})
export class MarkFolderColorPickerComponent {
	@Input() markFolder: (hexColor: string) => void
}
