/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { State } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { AmbientLight, BufferGeometry, DirectionalLight, Group, Scene, Shape, Vector2, WebGLRenderer } from "three"
import { DEFAULT_SETTINGS, DEFAULT_STATE, FILE_META, TEST_NODES } from "../../../util/dataMocks"
import { CodeMapMesh } from "../../codeMap/rendering/codeMapMesh"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Export3DMapButtonModule } from "../export3DMapButton.module"
import { Export3DMapDialogComponent } from "./export3DMapDialog.component"
import { QrCodeMesh } from "../../../services/3DExports/3DPreview/MeshModels/BackMeshModels/qrCodeMesh"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { CCFile, CodeMapNode, ColorMode, NodeType } from "../../../codeCharta.model"

jest.mock("three/examples/jsm/loaders/SVGLoader", () => {
    return {
        SVGLoader: jest.fn().mockImplementation(() => {
            return {
                load: (url: string, onLoad, onProgress?, onError?) => {
                    // Mock a scenario where the SVG loads successfully
                    const mockSVGData = {
                        paths: [
                            {
                                toShapes: jest.fn().mockReturnValue([new Shape()])
                            }
                        ]
                    }
                    onLoad(mockSVGData)
                }
            }
        })
    }
})

// get state and files lines up

const TestNodeMap: CodeMapNode = {
    name: "root",
    attributes: { a: 20, b: 15, mcc: 5 },
    type: NodeType.FOLDER,
    isExcluded: false,
    isFlattened: false,
    children: [
        {
            name: "big leaf.ts",
            path: "root/big leaf.ts",
            type: NodeType.FILE,
            attributes: { a: 20, b: 15, mcc: 20 }
        }
    ]
}

const TestState = { ...DEFAULT_STATE }
TestState.dynamicSettings.areaMetric = "a"
TestState.dynamicSettings.heightMetric = "b"
TestState.dynamicSettings.colorMetric = "mcc"
TestState.dynamicSettings.colorRange = { from: 4, to: 8 }
TestState.dynamicSettings.colorMode = ColorMode.absolute
const TestFile: CCFile = { fileMeta: FILE_META, map: TestNodeMap, settings: DEFAULT_SETTINGS }
const TestFileSTate: FileState = { file: TestFile, selectedAs: FileSelectionState.Partial }
TestState.files = [TestFileSTate]

describe("Export3DMapDialogComponent2", () => {
    let codeMapMesh: CodeMapMesh
    let lightScene: Scene

    let threeSceneServiceMock: any

    const mockedWebGLRenderer = () => {
        const fakeDomElementProver = (): HTMLCanvasElement => {
            return document.createElement("canvas")
        }
        const webGLRenderer = {
            context: {
                getParameter: jest.fn().mockReturnValue(["WebGL 2"]),
                getExtension: jest.fn().mockReturnValue({
                    EXT_blend_minmax: null
                }),
                createTexture: jest.fn(),
                bindTexture: jest.fn(),
                texParameteri: jest.fn(),
                texImage2D: jest.fn(),
                clearColor: jest.fn(),
                clearDepth: jest.fn(),
                clearStencil: jest.fn(),
                enable: jest.fn(),
                disable: jest.fn(),
                depthFunc: jest.fn(),
                frontFace: jest.fn(),
                cullFace: jest.fn(),
                initGLContext: jest.fn(),
                scissor: jest.fn(),
                viewport: jest.fn()
            } as unknown as WebGLRenderingContext
        } as WebGLRenderer

        webGLRenderer.domElement = fakeDomElementProver()

        webGLRenderer.getPixelRatio = jest.fn().mockReturnValue(2)
        webGLRenderer.setClearColor = jest.fn()
        webGLRenderer.render = jest.fn()
        webGLRenderer.setPixelRatio = jest.fn()
        webGLRenderer.getDrawingBufferSize = jest.fn().mockReturnValue({
            size: {
                width: 1,
                height: 1
            }
        })
        webGLRenderer.setSize = jest.fn()
        webGLRenderer.getSize = jest.fn().mockImplementation((vector2: Vector2) => {
            vector2.set(200, 150)
        })

        return webGLRenderer
    }

    beforeEach(() => {
        codeMapMesh = new CodeMapMesh(TEST_NODES, TestState, false)
        lightScene = new Scene()
        const lightGroup = new Group()

        const ambilight = new AmbientLight(0x70_70_70) // soft white light
        const light1 = new DirectionalLight(0xe0_e0_e0, 1)
        light1.position.set(50, 10, 8).normalize()
        const light2 = new DirectionalLight(0xe0_e0_e0, 1)
        light2.position.set(-50, 10, -8).normalize()
        lightGroup.add(ambilight, light1, light2)
        lightScene.add(new Group(), new Group(), new Group(), lightGroup)

        threeSceneServiceMock = {
            getMapMesh: jest.fn().mockReturnValue(codeMapMesh),
            scene: lightScene
        }

        jest.spyOn(Export3DMapDialogComponent.prototype, "getGL").mockReturnValue(mockedWebGLRenderer())
        jest.spyOn(QrCodeMesh.prototype, "create").mockImplementation(async () => {
            return new Promise(resolve => {
                resolve(new BufferGeometry())
            })
        })
    })

    async function setup() {
        const renderObject = await render(Export3DMapDialogComponent, {
            imports: [Export3DMapButtonModule],
            providers: [
                { provide: State, useValue: { getValue: () => TestState } },
                { provide: ThreeSceneService, useValue: threeSceneServiceMock }
            ],
            excludeComponentDeclaration: true
        })

        return renderObject
    }

    it("should update printer stats", async () => {
        const dut = await setup()
        const { detectChanges } = dut

        let scale = screen.getByTestId("printSizeOverview").innerHTML
        expect(scale).toContain("max. 35.5")
        expect(scale).toContain("max. 33.5")

        const selectElement = screen.getByTestId("selectPrinter")
        await userEvent.click(selectElement)
        detectChanges()

        const options = screen.getAllByTestId("selectedPrinter")
        expect(options).toHaveLength(3)

        await userEvent.click(options[0])
        detectChanges()

        scale = screen.getByTestId("printSizeOverview").innerHTML
        expect(scale).toContain("max. 24.5")
        expect(scale).toContain("max. 20.5")
    })

    it("should update front text when input changes", async () => {
        const { fixture } = await setup()
        const inputElement = screen.getByTestId("frontText") as HTMLInputElement
        expect(inputElement).toBeTruthy()

        const frontTextInput = "Test Front Text"
        await userEvent.type(inputElement, frontTextInput)
        fixture.detectChanges()
        expect(inputElement.value).toBe(frontTextInput)
    })

    it("should update second row text when input changes", async () => {
        const { fixture } = await setup()
        const toggleElement = screen.getByTestId("secondRowToggle") as HTMLInputElement
        await userEvent.click(toggleElement)

        const inputElement = screen.getByTestId("secondRowText") as HTMLInputElement
        expect(inputElement).toBeTruthy()

        const secondRowTextInput = "Test Second Row Text"
        expect(inputElement.value).toBe(new Date().toLocaleDateString())
        await userEvent.clear(inputElement)
        await userEvent.type(inputElement, secondRowTextInput)
        fixture.detectChanges()
        expect(inputElement.value).toBe(secondRowTextInput)
    })

    it("should update QR code text when input changes", async () => {
        const { fixture } = await setup()
        const toggleElement = screen.getByTestId("qrCodeToggle") as HTMLInputElement
        await userEvent.click(toggleElement)

        const inputElement = screen.getByTestId("qrCodeText") as HTMLInputElement
        expect(inputElement).toBeTruthy()

        expect(inputElement.value).toBe("maibornwolff.de/service/it-sanierung")
        await userEvent.clear(inputElement)
        const qrCodeTextInput = "Test QR Code"
        await userEvent.type(inputElement, qrCodeTextInput)
        fixture.detectChanges()
        expect(inputElement.value).toBe(qrCodeTextInput)
    })
})
