import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FormsModule } from "@angular/forms"
import { By } from "@angular/platform-browser"
import { Export3DMapDialogComponent } from "./export3DMapDialog.component"
import { State } from "@ngrx/store"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"

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
            imports: [FormsModule],
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
})
