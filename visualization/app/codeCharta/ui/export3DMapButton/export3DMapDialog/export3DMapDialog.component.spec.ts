import { TestBed } from "@angular/core/testing"
import { Export3DMapDialogComponent } from "./export3DMapDialog.component"
import { fireEvent, render, screen } from "@testing-library/angular"
import { State } from "@ngrx/store"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { DEFAULT_STATE, TEST_NODES } from "../../../util/dataMocks"
import { CodeMapMesh } from "../../codeMap/rendering/codeMapMesh"
import { defaultState } from "../../../state/store/state.manager"
import { Vector3 } from "three"
import { FormsModule } from "@angular/forms"

describe("Export3DMapDialogComponent", () => {
    let codeMapMesh: CodeMapMesh
    let threeSceneServiceMock: any
    let updateNumberOfColorsMock: jest.Mock
    let updateSizeMock: jest.Mock
    let getSizeMock: jest.Mock
    let updateFrontTextMock: jest.Mock
    let cameraMock: any

    beforeEach(() => {
        codeMapMesh = new CodeMapMesh(TEST_NODES, DEFAULT_STATE, false)

        threeSceneServiceMock = {
            getMapMesh: jest.fn().mockReturnValue(codeMapMesh)
        }

        updateNumberOfColorsMock = jest.fn()
        updateFrontTextMock = jest.fn()
        updateSizeMock = jest.fn().mockReturnValue(new Promise(resolve => resolve(false)))
        getSizeMock = jest.fn().mockReturnValue(new Vector3(10, 10, 10))
        cameraMock = {
            position: {
                set: jest.fn()
            }
        }

        TestBed.configureTestingModule({
            providers: [
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeSceneService, useValue: threeSceneServiceMock }
            ],
            imports: [FormsModule]
        }).compileComponents()
    })

    async function setup() {
        const { fixture } = await render(Export3DMapDialogComponent, { excludeComponentDeclaration: true })
        const component = fixture.componentInstance

        Object.defineProperty(component, "previewMesh", {
            value: {
                updateNumberOfColors: updateNumberOfColorsMock,
                updateSize: updateSizeMock,
                getSize: getSizeMock,
                updateFrontText: updateFrontTextMock,
                printMesh: { traverse: jest.fn() },
                mapMesh: { geometry: {} },
                updateMapColors: jest.fn(),
                updateColor: jest.fn()
            },
            writable: true
        })

        Object.defineProperty(component, "printPreviewScene", {
            value: {
                getObjectByName: jest.fn().mockReturnValue(cameraMock)
            },
            writable: true
        })

        return { component, fixture }
    }

    it("should render the dialog", async () => {
        await render(Export3DMapDialogComponent, { excludeComponentDeclaration: true })
        const dialog = screen.getByText("3D Print CodeCharta Map")
        expect(dialog).not.toBe(null)
    })

    it("should update number of colors on printer change", async () => {
        const { component } = await setup()

        component.selectedPrinter = component.printers[1]

        component.onSelectedPrinterChange()

        expect(threeSceneServiceMock.getMapMesh).toHaveBeenCalled()
        expect(updateNumberOfColorsMock).toHaveBeenCalled()
        expect(component["currentNumberOfColors"]).toBe(component.selectedPrinter.numberOfColors)
        expect(cameraMock.position.set).toHaveBeenCalled()
    })

    it("should update scaling parameters when adjusting the scaling slider", async () => {
        const { component, fixture } = await setup()

        component.wantedWidth = 150

        const slider = fixture.nativeElement.querySelector("input[matSliderThumb]")
        expect(slider).not.toBeNull()

        fireEvent.input(slider, { target: { value: "150" } })

        component.onScaleChange()

        expect(updateSizeMock).toHaveBeenCalledWith(150)
        expect(getSizeMock).toHaveBeenCalled()
        expect(component["currentSize"].equals(new Vector3(10, 10, 10))).toBe(true)
    })

    it("should update front text when input changes", async () => {
        const { component, fixture } = await setup()

        component.frontText = "CodeCharta Map 3D Print"
        fixture.detectChanges()
        const input = fixture.nativeElement.querySelector("input[matInput]")
        expect(input).not.toBeNull()

        fireEvent.input(input, { target: { value: "CodeCharta Map 3D Print" } })

        fixture.detectChanges()

        component.onFrontTextChange()

        expect(component.frontText).toBe("CodeCharta Map 3D Print")
        expect(updateFrontTextMock).toHaveBeenCalledWith("CodeCharta Map 3D Print")
    })
})
