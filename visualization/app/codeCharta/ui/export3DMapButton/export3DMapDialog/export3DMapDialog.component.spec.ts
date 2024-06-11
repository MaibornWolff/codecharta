import { TestBed } from "@angular/core/testing"
import { Export3DMapDialogComponent } from "./export3DMapDialog.component"
import { render, screen } from "@testing-library/angular"
import { State } from "@ngrx/store"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { DEFAULT_STATE, TEST_NODES } from "../../../util/dataMocks"
import { CodeMapMesh } from "../../codeMap/rendering/codeMapMesh"
import { defaultState } from "../../../state/store/state.manager"
import { Vector3 } from "three"

describe("Export3DMapDialogComponent", () => {
    beforeEach(() => {
        const codeMapMesh = new CodeMapMesh(TEST_NODES, DEFAULT_STATE, false)

        TestBed.configureTestingModule({
            providers: [
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: ThreeSceneService,
                    useValue: {
                        getMapMesh: jest.fn().mockReturnValue(codeMapMesh)
                    }
                }
            ]
        })
    })

    it("should render the dialog", async function () {
        await render(Export3DMapDialogComponent, { excludeComponentDeclaration: true })
        const dialog = screen.getByText("3D Print CodeCharta Map")
        expect(dialog).not.toBe(null)
    })

    it("should update number of colors on printer change", async () => {
        const { fixture } = await render(Export3DMapDialogComponent, { excludeComponentDeclaration: true })

        const component = fixture.componentInstance
        const threeSceneService = TestBed.inject(ThreeSceneService)

        const updateNumberOfColorsMock = jest.fn()
        const updateSizeMock = jest.fn().mockReturnValue(new Promise(resolve => resolve(false)))
        const getSizeMock = jest.fn().mockReturnValue(new Vector3(10, 10, 10))
        Object.defineProperty(component, "previewMesh", {
            value: {
                updateNumberOfColors: updateNumberOfColorsMock,
                updateSize: updateSizeMock,
                getSize: getSizeMock,
                printMesh: { traverse: jest.fn() },
                mapMesh: { geometry: {} },
                updateMapColors: jest.fn(),
                updateColor: jest.fn()
            },
            writable: true
        })
        const cameraMock = {
            position: {
                set: jest.fn()
            }
        }
        Object.defineProperty(component, "printPreviewScene", {
            value: {
                getObjectByName: jest.fn().mockReturnValue(cameraMock)
            },
            writable: true
        })

        component.selectedPrinter = component.printers[1]

        component.onSelectedPrinterChange()

        expect(threeSceneService.getMapMesh).toHaveBeenCalled()
        expect(updateNumberOfColorsMock).toHaveBeenCalled()
        expect(component["currentNumberOfColors"]).toBe(component.selectedPrinter.numberOfColors)
        expect(cameraMock.position.set).toHaveBeenCalled()
    })
})
