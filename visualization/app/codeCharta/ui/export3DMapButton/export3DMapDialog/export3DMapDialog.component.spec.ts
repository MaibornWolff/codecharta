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
})
