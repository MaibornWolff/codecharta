import "./markFolderColorPicker.component.scss"
import { Component, Input } from "@angular/core"

@Component({
	selector: "cc-mark-folder-color-picker",
	template: require("./markFolderColorPicker.component.html")
})
export class MarkFolderColorPickerComponent {
	@Input() markFolder: (hexColor: string) => void
}
