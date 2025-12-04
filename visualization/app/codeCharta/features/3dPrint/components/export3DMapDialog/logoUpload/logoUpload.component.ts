import { Component, ElementRef, input, output, viewChild } from "@angular/core"
import { LabelledColorPickerComponent } from "../../../../../ui/labelledColorPicker/labelledColorPicker.component"

@Component({
    selector: "cc-logo-upload",
    templateUrl: "./logoUpload.component.html",
    imports: [LabelledColorPickerComponent]
})
export class LogoUploadComponent {
    fileInput = viewChild.required<ElementRef<HTMLInputElement>>("fileInput")

    isFileSelected = input.required<boolean>()
    logoColor = input<string>("#ffffff")

    fileSelected = output<File>()
    logoRemoved = output<void>()
    logoRotated = output<void>()
    logoFlipped = output<void>()
    colorChanged = output<string>()

    handleFileSelected(event: Event) {
        const input = event.target as HTMLInputElement
        const file = input.files?.[0]
        if (file) {
            this.fileSelected.emit(file)
        }
    }

    handleRemoveLogo() {
        this.fileInput().nativeElement.value = ""
        this.logoRemoved.emit()
    }

    handleRotateLogo() {
        this.logoRotated.emit()
    }

    handleFlipLogo() {
        this.logoFlipped.emit()
    }

    handleColorChange(color: string) {
        this.colorChanged.emit(color)
    }
}
