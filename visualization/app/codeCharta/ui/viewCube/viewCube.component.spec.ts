import { ThreeMapControlsService } from "../codeMap/threeViewer/threeMapControls.service"
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { Color, Mesh, Vector3, WebGLRenderer } from "three"
import { MapControls } from "three/examples/jsm/controls/MapControls"
import { ViewCubeComponent } from "./viewCube.component"

describe("ViewCubeComponent", () => {
    let viewCubeComponent: ViewCubeComponent
    let threeMapControlsService: ThreeMapControlsService
    let viewCubeMouseEventsService: ViewCubeMouseEventsService

    beforeEach(() => {
        threeMapControlsService = {} as ThreeMapControlsService
        viewCubeMouseEventsService = { init: jest.fn() } as unknown as ViewCubeMouseEventsService
        threeMapControlsService.controls = {
            target: new Vector3(1, 2, 3)
        } as unknown as MapControls
        ViewCubeComponent.prototype["initRenderer"] = jest.fn()
        ViewCubeComponent.prototype["onAnimationFrame"] = jest.fn()
        const elementReference = { nativeElement: {} as HTMLElement }
        viewCubeComponent = new ViewCubeComponent(elementReference, threeMapControlsService, viewCubeMouseEventsService)
    })

    describe("onCameraChanged", () => {
        it("should call setCameraPosition", () => {
            viewCubeComponent["setCameraPosition"] = jest.fn()
            viewCubeComponent["renderer"] = {
                render: jest.fn()
            } as unknown as WebGLRenderer
            const perspectiveCamera = new PerspectiveCamera(
                ThreeCameraService.VIEW_ANGLE,
                1,
                ThreeCameraService.NEAR,
                ThreeCameraService.FAR
            )

            viewCubeComponent.onCameraChanged({ camera: perspectiveCamera })

            expect(viewCubeComponent["setCameraPosition"]).toHaveBeenCalledWith({
                x: -0.801_783_725_737_273_2,
                y: -1.603_567_451_474_546_4,
                z: -2.405_351_177_211_819_5
            })
        })
    })

    describe("onCubeHovered", () => {
        it("should set hover info cube emissive color to white", () => {
            viewCubeComponent["renderer"] = {
                render: jest.fn()
            } as unknown as WebGLRenderer
            viewCubeComponent.onCubeHovered({ cube: new Mesh() })

            expect(viewCubeComponent["hoverInfo"].cube.material.emissive).toStrictEqual(new Color(0xff_ff_ff))
        })
    })

    describe("onCubeUnHovered", () => {
        it("should set cube to null", () => {
            viewCubeComponent["hoverInfo"].cube = {
                material: {
                    emissive: new Color(0xff_ff_ff)
                }
            }
            viewCubeComponent["renderer"] = {
                render: jest.fn()
            } as unknown as WebGLRenderer
            viewCubeComponent.onCubeUnhovered()

            expect(viewCubeComponent["hoverInfo"].cube).toBe(null)
        })
    })

    describe("onCubeClicked", () => {
        const generateHorizontalMesh = () => {
            return {
                left: new Mesh(),
                center: new Mesh(),
                right: new Mesh()
            }
        }

        const generateTopMesh = () => {
            return {
                front: generateHorizontalMesh(),
                middle: generateHorizontalMesh(),
                back: generateHorizontalMesh()
            }
        }

        const generateSidesMesh = () => {
            return {
                front: generateHorizontalMesh(),
                middle: {
                    left: new Mesh(),
                    right: new Mesh()
                },
                back: generateHorizontalMesh()
            }
        }

        const cubeDefinition = {
            top: generateTopMesh(),
            sides: generateSidesMesh()
        }

        const generateTopTests = () => {
            return [
                {
                    expectedString: "(1, -1, 1)",
                    whenObject: "top.front.left",
                    eventValue: cubeDefinition.top.front.left,
                    expected: { x: 1, y: -1, z: 1 }
                },
                {
                    expectedString: "(0, -1, 1)",
                    whenObject: "top.front.center",
                    eventValue: cubeDefinition.top.front.center,
                    expected: { x: 0, y: -1, z: 1 }
                },
                {
                    expectedString: "(-1, -1, 1)",
                    whenObject: "top.front.right",
                    eventValue: cubeDefinition.top.front.right,
                    expected: { x: -1, y: -1, z: 1 }
                },

                {
                    expectedString: "(1, -1, 0)",
                    whenObject: "top.middle.left",
                    eventValue: cubeDefinition.top.middle.left,
                    expected: { x: 1, y: -1, z: 0 }
                },
                {
                    expectedString: "(0, -1, 0)",
                    whenObject: "top.middle.center",
                    eventValue: cubeDefinition.top.middle.center,
                    expected: { x: 0, y: -1, z: 0 }
                },
                {
                    expectedString: "(-1, -1, 0)",
                    whenObject: "top.middle.right",
                    eventValue: cubeDefinition.top.middle.right,
                    expected: { x: -1, y: -1, z: 0 }
                },

                {
                    expectedString: "(1, -1, -1)",
                    whenObject: "top.back.left",
                    eventValue: cubeDefinition.top.back.left,
                    expected: { x: 1, y: -1, z: -1 }
                },
                {
                    expectedString: "(0, -1, -1)",
                    whenObject: "top.back.center",
                    eventValue: cubeDefinition.top.back.center,
                    expected: { x: 0, y: -1, z: -1 }
                },
                {
                    expectedString: "(-1, -1, -1)",
                    whenObject: "top.back.right",
                    eventValue: cubeDefinition.top.back.right,
                    expected: { x: -1, y: -1, z: -1 }
                }
            ]
        }

        const generateSidesTests = () => {
            return [
                {
                    expectedString: "(1, 0, -1)",
                    whenObject: "sides.front.left",
                    eventValue: cubeDefinition.sides.front.left,
                    expected: { x: 1, y: 0, z: -1 }
                },
                {
                    expectedString: "(0, 0, 0)",
                    whenObject: "sides.front.center",
                    eventValue: cubeDefinition.sides.front.center,
                    expected: { x: 0, y: 0, z: 0 }
                },
                {
                    expectedString: "(-1, 0, -1)",
                    whenObject: "sides.front.right",
                    eventValue: cubeDefinition.sides.front.right,
                    expected: { x: -1, y: 0, z: -1 }
                },

                {
                    expectedString: "(1, 0, 0)",
                    whenObject: "sides.middle.left",
                    eventValue: cubeDefinition.sides.middle.left,
                    expected: { x: 1, y: 0, z: 0 }
                },
                {
                    expectedString: "(-1, 0, 0)",
                    whenObject: "sides.middle.right",
                    eventValue: cubeDefinition.sides.middle.right,
                    expected: { x: -1, y: 0, z: 0 }
                },

                {
                    expectedString: "(1, 0, 1)",
                    whenObject: "sides.back.left",
                    eventValue: cubeDefinition.sides.back.left,
                    expected: { x: 1, y: 0, z: 1 }
                },
                {
                    expectedString: "(0, 0, 1)",
                    whenObject: "sides.back.center",
                    eventValue: cubeDefinition.sides.back.center,
                    expected: { x: 0, y: 0, z: 1 }
                },
                {
                    expectedString: "(-1, 0, 1)",
                    whenObject: "sides.back.right",
                    eventValue: cubeDefinition.sides.back.right,
                    expected: { x: -1, y: 0, z: 1 }
                }
            ]
        }

        const loopTests = [...generateTopTests(), ...generateSidesTests()]

        beforeEach(() => {
            threeMapControlsService.rotateCameraInVectorDirection = jest.fn()
            viewCubeComponent["cubeDefinition"] = cubeDefinition
        })

        for (const test of loopTests) {
            it(`should rotateCameraInVectorDirection with ${test.expectedString} when mesh is ${test.whenObject}`, () => {
                viewCubeComponent.onCubeClicked({ cube: test.eventValue })

                const expected = test.expected
                expect(threeMapControlsService.rotateCameraInVectorDirection).toHaveBeenCalledWith(expected.x, expected.y, expected.z)
            })
        }
    })
})
