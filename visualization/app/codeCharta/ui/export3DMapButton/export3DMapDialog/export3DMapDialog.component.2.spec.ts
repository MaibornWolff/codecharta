/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { State } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { AmbientLight, BufferGeometry, DirectionalLight, Group, Scene, Shape, Vector2, Vector3, WebGLRenderer } from "three"
import { Preview3DPrintMesh } from "../../../services/3DExports/3DPreview/preview3DPrintMesh"
import { DEFAULT_STATE, TEST_NODES } from "../../../util/dataMocks"
import { CodeMapMesh } from "../../codeMap/rendering/codeMapMesh"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Export3DMapButtonModule } from "../export3DMapButton.module"
import { Export3DMapDialogComponent } from "./export3DMapDialog.component"
import { QrCodeMesh } from "../../../services/3DExports/3DPreview/MeshModels/BackMeshModels/qrCodeMesh"

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

class MockState {
    getValue() {
        return {
            dynamicSettings: {
                areaMetric: "loc",
                heightMetric: "rloc",
                colorMetric: "mcc"
            },
            files: [],
            fileSettings: {
                attributeTypes: { nodes: {}, edges: {} },
                attributeDescriptors: {},
                blacklist: [],
                edges: [],
                markedPackages: []
            }
        }
    }
}

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
        codeMapMesh = new CodeMapMesh(TEST_NODES, DEFAULT_STATE, false)
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
        jest.spyOn(Preview3DPrintMesh.prototype, "getSize").mockReturnValue(new Vector3(10, 10, 10))

        const renderObject = await render(Export3DMapDialogComponent, {
            imports: [Export3DMapButtonModule],
            providers: [
                { provide: State, useClass: MockState },
                { provide: ThreeSceneService, useValue: threeSceneServiceMock }
            ],
            excludeComponentDeclaration: true
        })

        return renderObject
    }

    it.skip("should update printer stats", async () => {
        const dut = await setup()
        const { fixture, debugElement, detectChanges } = dut

        const selectElement = screen.getByTestId("selectPrinter")
        await userEvent.click(selectElement)
        detectChanges()

        const options = screen.getAllByTestId("selectedPrinter")

        expect(options).toHaveLength(3)

        await userEvent.click(options[0])
        detectChanges()

        const scale = screen.getByTestId("scale").innerHTML
    })
})