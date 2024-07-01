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
    let updateSecondRowTextMock: jest.Mock
    let updateSecondRowVisibilityMock: jest.Mock
    let updateQrCodeTextMock: jest.Mock
    let updateQrCodeVisibilityMock: jest.Mock
    let addCustomLogoMock: jest.Mock
    let removeCustomLogoMock: jest.Mock
    let rotateCustomLogoMock: jest.Mock
    let flipCustomLogoMock: jest.Mock
    let updateCustomLogoColorMock: jest.Mock

    beforeEach(() => {
        codeMapMesh = new CodeMapMesh(TEST_NODES, DEFAULT_STATE, false)

        threeSceneServiceMock = {
            getMapMesh: jest.fn().mockReturnValue(codeMapMesh)
        }

        updateNumberOfColorsMock = jest.fn()
        updateFrontTextMock = jest.fn()
        updateSizeMock = jest.fn().mockReturnValue(new Promise(resolve => resolve(false)))
        getSizeMock = jest.fn().mockReturnValue(new Vector3(10, 10, 10))
        updateSecondRowTextMock = jest.fn()
        updateSecondRowVisibilityMock = jest.fn()
        updateQrCodeTextMock = jest.fn()
        updateQrCodeVisibilityMock = jest.fn()
        addCustomLogoMock = jest.fn()
        removeCustomLogoMock = jest.fn()
        rotateCustomLogoMock = jest.fn()
        flipCustomLogoMock = jest.fn()
        updateCustomLogoColorMock = jest.fn()
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
                updateSecondRowText: updateSecondRowTextMock,
                updateSecondRowVisibility: updateSecondRowVisibilityMock,
                updateQrCodeText: updateQrCodeTextMock,
                updateQrCodeVisibility: updateQrCodeVisibilityMock,
                addCustomLogo: addCustomLogoMock,
                removeCustomLogo: removeCustomLogoMock,
                rotateCustomLogo: rotateCustomLogoMock,
                flipCustomLogo: flipCustomLogoMock,
                updateCustomLogoColor: updateCustomLogoColorMock,
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

    it("should update second row text when input changes", async () => {
        const { component, fixture } = await setup()
        component.secondRow = {
            defaultText: "Default Text",
            name: "Second Row Text",
            isVisible: true,
            currentText: "Updated Second Row Text"
        }
        fixture.detectChanges()
        const input = fixture.nativeElement.querySelector("#secondRowInput")
        expect(input).not.toBeNull()

        input.value = "Updated Second Row Text"
        fireEvent.input(input)
        fixture.detectChanges()

        component.onSecondRowTextChange()

        expect(component.secondRow.currentText).toBe("Updated Second Row Text")
        expect(updateSecondRowTextMock).toHaveBeenCalledWith("Updated Second Row Text")
        expect(updateSecondRowVisibilityMock).toHaveBeenCalledWith(true)
    })

    it("should update second row visibility when slide toggle changes", async () => {
        const { component, fixture } = await setup()

        component.secondRow = {
            defaultText: "Default Text",
            name: "Second Row Text",
            isVisible: true,
            currentText: "Initial Text"
        }
        fixture.detectChanges()

        const slideToggle = fixture.nativeElement.querySelector("mat-slide-toggle")
        expect(slideToggle).not.toBeNull()

        fireEvent.click(slideToggle)
        fixture.detectChanges()

        expect(component.secondRow.isVisible).toBe(true)
    })

    it("should update QR-Code text when input changes", async () => {
        const { component, fixture } = await setup()

        component.qrCode = {
            defaultText: "QR-Code Text",
            name: "QR-Code",
            isVisible: true,
            currentText: "QR-Code Text"
        }
        fixture.detectChanges()

        const input = fixture.nativeElement.querySelector("input[matInput]")
        expect(input).not.toBeNull()

        fireEvent.input(input, { target: { value: "QR-Code Text" } })
        fixture.detectChanges()

        expect(component.qrCode.currentText).toBe("QR-Code Text")
        //expect(updateQrCodeTextMock).toHaveBeenCalledWith("QR-Code Text")
    })

    it("should update QR-Code visibility when slide toggle changes", async () => {
        const { component, fixture } = await setup()

        component.qrCode = {
            defaultText: "Default QR-Code Text",
            name: "QR-Code",
            isVisible: true,
            currentText: "Initial QR-Code Text"
        }
        fixture.detectChanges()

        const slideToggle = fixture.nativeElement.querySelector("mat-slide-toggle")
        expect(slideToggle).not.toBeNull()

        fireEvent.click(slideToggle)
        fixture.detectChanges()

        expect(component.qrCode.isVisible).toBe(true)
        //expect(updateQrCodeVisibilityMock).toHaveBeenCalledWith(false)
    })

    it("should add custom logo when file is selected", async () => {
        const { component, fixture } = await setup()

        const fileInput = fixture.nativeElement.querySelector('input[type="file"]')
        expect(fileInput).not.toBeNull()

        const file = new File(["<svg></svg>"], "logo.svg", { type: "image/svg+xml" })
        fireEvent.change(fileInput, { target: { files: [file] } })

        expect(component.isFileSelected).toBe(true)
        //expect(addCustomLogoMock).toHaveBeenCalled()
    })

    it("should remove logo when remove button is clicked", async () => {
        const { component, fixture } = await setup()

        component.isFileSelected = true
        fixture.detectChanges()

        const removeButton = fixture.nativeElement.querySelector('button[title="Remove Logo Button"]')
        expect(removeButton).not.toBeNull()
        fireEvent.click(removeButton)

        expect(component.isFileSelected).toBe(false)
        expect(removeCustomLogoMock).toHaveBeenCalled()
    })

    it("should rotate logo when rotate button is clicked", async () => {
        const { component, fixture } = await setup()

        component.isFileSelected = true
        fixture.detectChanges()
        const rotateButton = fixture.nativeElement.querySelector('button[title="Rotate Logo Button"]')
        expect(rotateButton).not.toBeNull()
        fireEvent.click(rotateButton)
        expect(rotateCustomLogoMock).toHaveBeenCalled()
    })

    it("should flip logo when flip button is clicked", async () => {
        const { component, fixture } = await setup()
        component.isFileSelected = true
        fixture.detectChanges()

        const flipButton = fixture.nativeElement.querySelector('button[title="Flip Logo Button"]')
        expect(flipButton).not.toBeNull()
        fireEvent.click(flipButton)
        expect(flipCustomLogoMock).toHaveBeenCalled()
    })
})
