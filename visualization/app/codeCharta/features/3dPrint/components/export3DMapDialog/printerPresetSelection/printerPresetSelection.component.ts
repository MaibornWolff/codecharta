import { Component, input, output } from "@angular/core"

export interface Printer {
    name: string
    x: number
    y: number
    z: number
    numberOfColors: number
}

export const PRINTER_PRESETS: Printer[] = [
    { name: "Prusa MK3S (single color)", x: 245, y: 205, z: 205, numberOfColors: 1 },
    { name: "BambuLab A1 + AMS Lite", x: 251, y: 251, z: 251, numberOfColors: 4 },
    { name: "Prusa XL (5 colors)", x: 355, y: 335, z: 355, numberOfColors: 5 }
]

@Component({
    selector: "cc-printer-preset-selection",
    templateUrl: "./printerPresetSelection.component.html"
})
export class PrinterPresetSelectionComponent {
    selectedPrinter = input.required<Printer>()
    printerChanged = output<Printer>()

    printers = PRINTER_PRESETS

    handlePrinterChange(event: Event) {
        const select = event.target as HTMLSelectElement
        const printer = this.printers[select.selectedIndex]
        this.printerChanged.emit(printer)
    }
}
