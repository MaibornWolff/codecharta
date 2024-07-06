import { ComponentFixture, TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { Export3DMapDialogComponent } from "./export3DMapDialog.component"
import { State } from "@ngrx/store"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Export3DMapButtonModule } from "../export3DMapButton.module"
import { MatSlideToggleChange } from "@angular/material/slide-toggle"

class MockState {
    getValue() {
        return {
            dynamicSettings: {
                areaMetric: "areaMetricMock",
                heightMetric: "heightMetricMock",
                colorMetric: "colorMetricMock"
            },
            files: [],
            fileSettings: {
                blacklist: []
            }
        }
    }
}

class MockThreeSceneService {
    getMapMesh() {
        return {
            getThreeMesh: () => ({
                geometry: {
                    boundingBox: {
                        min: { x: 0, y: 0, z: 0 },
                        max: { x: 10, y: 10, z: 10 }
                    },
                    computeBoundingBox() {
                        this.boundingBox = {
                            min: { x: 0, y: 0, z: 0 },
                            max: { x: 10, y: 10, z: 10 }
                        }
                    }
                }
            })
        }
    }
}

describe("Export3DMapDialogComponent", () => {
    let component: Export3DMapDialogComponent
    let fixture: ComponentFixture<Export3DMapDialogComponent>
    let inputElement: HTMLInputElement

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [Export3DMapDialogComponent],
            imports: [Export3DMapButtonModule],
            providers: [
                { provide: State, useClass: MockState },
                { provide: ThreeSceneService, useClass: MockThreeSceneService }
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(Export3DMapDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        component.onFrontTextChange = function () {
            this.frontText = inputElement.value
        }
        component.onSecondRowTextChange = function () {
            this.secondRow.currentText = inputElement.value
            this.secondRow.isVisible = Boolean(this.secondRow.currentText)
        }
        component.onSecondRowVisibilityChange = function (event: MatSlideToggleChange) {
            this.secondRow.isVisible = event.checked
        }
        component.onQrCodeTextChange = function () {
            this.qrCode.currentText = inputElement.value
            this.qrCode.isVisible = Boolean(this.qrCode.currentText)
        }
        component.onQrCodeVisibilityChange = function (event: MatSlideToggleChange) {
            this.qrCode.isVisible = event.checked
        }
        component.printers = [
            { name: "Prusa MK3S (single color)", x: 245, y: 205, z: 205, numberOfColors: 1 },
            { name: "BambuLab A1 + AMS Lite", x: 251, y: 251, z: 251, numberOfColors: 4 },
            { name: "Prusa XL (5 colors)", x: 355, y: 335, z: 355, numberOfColors: 5 }
        ]
        component.selectedPrinter = component.printers[2]

        component.onSelectedPrinterChange = function () {
            this.selectedPrinter = this.printers.find(printer => printer.name === this.selectedPrinter.name)
        }
        component.onRemoveLogo = function () {
            this.isFileSelected = false
        }
    })

    it("should update front text when input changes", () => {
        inputElement = fixture.debugElement.query(By.css('[data-testid="frontText"]')).nativeElement
        expect(inputElement).toBeTruthy()

        const frontTextInput = "FrontText"
        inputElement.value = frontTextInput
        inputElement.dispatchEvent(new Event("input"))
        fixture.detectChanges()
        expect(component.frontText).toBe(frontTextInput)
    })

    it("should update second row text when input changes", () => {
        inputElement = fixture.debugElement.query(By.css('[data-testid="secondRowText"]')).nativeElement
        expect(inputElement).toBeTruthy()

        const secondRowTextInput = "SecondRowText"
        inputElement.value = secondRowTextInput
        inputElement.dispatchEvent(new Event("input"))
        fixture.detectChanges()
        expect(component.secondRow.currentText).toBe(secondRowTextInput)
    })

    it("should set secondRow isVisible to true when input changes", () => {
        expect(component.secondRow.isVisible).toBeFalsy()

        inputElement = fixture.debugElement.query(By.css('[data-testid="secondRowText"]')).nativeElement
        expect(inputElement).toBeTruthy()

        const secondRowTextInput = "SecondRowText"
        inputElement.value = secondRowTextInput
        inputElement.dispatchEvent(new Event("input"))
        fixture.detectChanges()

        expect(component.secondRow.isVisible).toBeTruthy()
    })

    it("should set secondRow isVisible to true when the slide toggle is clicked", () => {
        expect(component.secondRow.isVisible).toBeFalsy()

        const slideToggleDebugElement = fixture.debugElement.query(By.css('[data-testid="secondRowToggle"]'))
        const slideToggle = slideToggleDebugElement.nativeElement
        expect(slideToggle).toBeTruthy()

        const event = new MatSlideToggleChange(slideToggleDebugElement.componentInstance, true)
        slideToggleDebugElement.triggerEventHandler("change", event)
        fixture.detectChanges()

        expect(component.secondRow.isVisible).toBeTruthy()
    })
    it("should update qrCode text when input changes", () => {
        inputElement = fixture.debugElement.query(By.css('[data-testid="qrCodeText"]')).nativeElement
        expect(inputElement).toBeTruthy()

        const qrCodeText = "qrCodeText"
        inputElement.value = qrCodeText
        inputElement.dispatchEvent(new Event("input"))
        fixture.detectChanges()
        expect(component.qrCode.currentText).toBe(qrCodeText)
    })

    it("should set qrCode isVisible to true when input changes", () => {
        expect(component.qrCode.isVisible).toBeFalsy()

        inputElement = fixture.debugElement.query(By.css('[data-testid="qrCodeText"]')).nativeElement
        expect(inputElement).toBeTruthy()

        const qrCodeText = "qrCodeText"
        inputElement.value = qrCodeText
        inputElement.dispatchEvent(new Event("input"))
        fixture.detectChanges()

        expect(component.qrCode.isVisible).toBeTruthy()
    })
    it("should set qrCode isVisible to true when the slide toggle is clicked", () => {
        expect(component.qrCode.isVisible).toBeFalsy()

        const slideToggleDebugElement = fixture.debugElement.query(By.css('[data-testid="qrCodeToggle"]'))
        const slideToggle = slideToggleDebugElement.nativeElement
        expect(slideToggle).toBeTruthy()

        const event = new MatSlideToggleChange(slideToggleDebugElement.componentInstance, true)
        slideToggleDebugElement.triggerEventHandler("change", event)
        fixture.detectChanges()

        expect(component.qrCode.isVisible).toBeTruthy()
    })
    it("should change selectedPrinter when a new printer is selected", () => {
        const selectPrinter = fixture.debugElement.query(By.css('[data-testid="selectPrinter"]')).nativeElement
        expect(selectPrinter).toBeTruthy()

        selectPrinter.click()
        fixture.detectChanges()

        const selectedPrinterOptions = fixture.debugElement.queryAll(By.css('[data-testid="selectedPrinter"]'))
        expect(selectedPrinterOptions.length).toBe(3)

        selectedPrinterOptions[1].nativeElement.click()
        fixture.detectChanges()

        expect(component.selectedPrinter).toBe(component.printers[1])
    })
    it("should set scale correctly when the slider is changed", () => {
        const sliderDebugElement = fixture.debugElement.query(By.css("mat-slider"))
        expect(sliderDebugElement).toBeTruthy()
        const sliderInputElement = sliderDebugElement.query(By.css("input")).nativeElement
        expect(sliderInputElement).toBeTruthy()

        sliderInputElement.value = 150
        sliderInputElement.dispatchEvent(new Event("input"))
        sliderInputElement.dispatchEvent(new Event("change"))
        fixture.detectChanges()

        expect(component.wantedWidth).toBe(150)
    })
    it("should set isFileSelected to true when a file is selected", () => {
        const inputDebugElement = fixture.debugElement.query(By.css('input[type="file"]'))
        expect(inputDebugElement).toBeTruthy()
        const inputElement = inputDebugElement.nativeElement
        expect(inputElement).toBeTruthy()

        const file = new File([""], "test.svg", { type: "image/svg+xml" })

        const event = new Event("change")
        Object.defineProperty(event, "target", { writable: false, value: { files: [file] } })

        inputElement.dispatchEvent(event)
        fixture.detectChanges()

        expect(component.isFileSelected).toBeTruthy()
    })

    it("should set isFileSelected to false when the logo is removed", () => {
        component.isFileSelected = true
        fixture.detectChanges()

        const removeButtonDebugElement = fixture.debugElement.query(By.css('button[title="Remove Logo Button"]'))
        removeButtonDebugElement.triggerEventHandler("click", null)
        fixture.detectChanges()

        expect(component.isFileSelected).toBeFalsy()
    })
    it('should call download3MFFile when the "Download 3MF" button is clicked', () => {
        const download3MFButtonDebugElement = fixture.debugElement.query(By.css('button[title="Download 3MF Button"]'))
        expect(download3MFButtonDebugElement).toBeTruthy()
        download3MFButtonDebugElement.triggerEventHandler("click", null)
        fixture.detectChanges()

        expect(component.download3MFFile).toBeTruthy()
    })

    it('should call downloadStlFile when the "Download minimal STL" button is clicked', () => {
        const downloadStlButtonDebugElement = fixture.debugElement.query(By.css('button[title="Download Stl Button"]'))
        expect(downloadStlButtonDebugElement).toBeTruthy()
        downloadStlButtonDebugElement.triggerEventHandler("click", null)
        fixture.detectChanges()

        expect(component.downloadStlFile).toBeTruthy()
    })
})
