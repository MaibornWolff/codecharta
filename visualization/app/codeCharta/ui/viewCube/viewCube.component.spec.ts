import "./viewCube.module"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControls.service"
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { Color, Mesh, Vector3, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ViewCubeComponent } from "./viewCube.component"

describe("ViewCubeComponent", () => {
	let viewCubeComponent: ViewCubeComponent
	let threeOrbitControlsService: ThreeOrbitControlsService
	let viewCubeMouseEventsService: ViewCubeMouseEventsService

	beforeEach(() => {
		threeOrbitControlsService = {} as ThreeOrbitControlsService
		viewCubeMouseEventsService = { init: jest.fn() } as unknown as ViewCubeMouseEventsService
		threeOrbitControlsService.controls = {
			target: new Vector3(1, 2, 3)
		} as OrbitControls
		ViewCubeComponent.prototype["initRenderer"] = jest.fn()
		ViewCubeComponent.prototype["onAnimationFrame"] = jest.fn()
		const elementReference = { nativeElement: {} as HTMLElement }
		viewCubeComponent = new ViewCubeComponent(elementReference, threeOrbitControlsService, viewCubeMouseEventsService)
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
		it("should set hover info cube emmisive color to white", () => {
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
				middle: new Mesh(),
				left: new Mesh(),
				right: new Mesh()
			}
		}

		const generateFaceMesh = () => {
			return {
				top: generateHorizontalMesh(),
				middle: generateHorizontalMesh(),
				bottom: generateHorizontalMesh()
			}
		}

		const cubeDefinition = {
			front: generateFaceMesh(),
			middle: generateFaceMesh(),
			back: generateFaceMesh()
		}

		const generateFrontTests = () => {
			return [
				{
					expectedString: "(0, -1, -1)",
					whenObject: "front.top.middle",
					eventValue: cubeDefinition.front.top.middle,
					expected: { x: 0, y: -1, z: -1 }
				},
				{
					expectedString: "(1, -1, -1)",
					whenObject: "front.top.left",
					eventValue: cubeDefinition.front.top.left,
					expected: { x: 1, y: -1, z: -1 }
				},
				{
					expectedString: "(-1, -1, -1)",
					whenObject: "front.top.right",
					eventValue: cubeDefinition.front.top.right,
					expected: { x: -1, y: -1, z: -1 }
				},

				{
					expectedString: "(0, 0, 0)",
					whenObject: "front.middle.middle",
					eventValue: cubeDefinition.front.middle.middle,
					expected: { x: 0, y: 0, z: 0 }
				},
				{
					expectedString: "(1, 0, -1)",
					whenObject: "front.middle.left",
					eventValue: cubeDefinition.front.middle.left,
					expected: { x: 1, y: 0, z: -1 }
				},
				{
					expectedString: "(-1, 0, -1)",
					whenObject: "front.middle.right",
					eventValue: cubeDefinition.front.middle.right,
					expected: { x: -1, y: 0, z: -1 }
				},

				{
					expectedString: "(0, 1, -1)",
					whenObject: "front.bottom.middle",
					eventValue: cubeDefinition.front.bottom.middle,
					expected: { x: 0, y: 1, z: -1 }
				},
				{
					expectedString: "(1, 1, -1)",
					whenObject: "front.bottom.left",
					eventValue: cubeDefinition.front.bottom.left,
					expected: { x: 1, y: 1, z: -1 }
				},
				{
					expectedString: "(-1, 1, -1)",
					whenObject: "front.bottom.right",
					eventValue: cubeDefinition.front.bottom.right,
					expected: { x: -1, y: 1, z: -1 }
				}
			]
		}

		const generateMiddleTests = () => {
			return [
				{
					expectedString: "(0, -1, 0)",
					whenObject: "middle.top.middle",
					eventValue: cubeDefinition.middle.top.middle,
					expected: { x: 0, y: -1, z: 0 }
				},
				{
					expectedString: "(1, -1, 0)",
					whenObject: "middle.top.left",
					eventValue: cubeDefinition.middle.top.left,
					expected: { x: 1, y: -1, z: 0 }
				},
				{
					expectedString: "(-1, -1, 0)",
					whenObject: "middle.top.right",
					eventValue: cubeDefinition.middle.top.right,
					expected: { x: -1, y: -1, z: 0 }
				},

				{
					expectedString: "(1, 0, 0)",
					whenObject: "middle.middle.left",
					eventValue: cubeDefinition.middle.middle.left,
					expected: { x: 1, y: 0, z: 0 }
				},
				{
					expectedString: "(-1, 0, 0)",
					whenObject: "middle.middle.right",
					eventValue: cubeDefinition.middle.middle.right,
					expected: { x: -1, y: 0, z: 0 }
				},

				{
					expectedString: "(0, 1, 0)",
					whenObject: "middle.bottom.middle",
					eventValue: cubeDefinition.middle.bottom.middle,
					expected: { x: 0, y: 1, z: 0 }
				},
				{
					expectedString: "(1, 1, 0)",
					whenObject: "middle.bottom.left",
					eventValue: cubeDefinition.middle.bottom.left,
					expected: { x: 1, y: 1, z: 0 }
				},
				{
					expectedString: "(-1, 1, 0)",
					whenObject: "middle.bottom.right",
					eventValue: cubeDefinition.middle.bottom.right,
					expected: { x: -1, y: 1, z: 0 }
				}
			]
		}

		const generateBackTests = () => {
			return [
				{
					expectedString: "(0, -1, 1)",
					whenObject: "back.top.middle",
					eventValue: cubeDefinition.back.top.middle,
					expected: { x: 0, y: -1, z: 1 }
				},
				{
					expectedString: "(1, -1, 1)",
					whenObject: "back.top.left",
					eventValue: cubeDefinition.back.top.left,
					expected: { x: 1, y: -1, z: 1 }
				},
				{
					expectedString: "(-1, -1, 1)",
					whenObject: "back.top.right",
					eventValue: cubeDefinition.back.top.right,
					expected: { x: -1, y: -1, z: 1 }
				},

				{
					expectedString: "(0, 0, 1)",
					whenObject: "back.middle.middle",
					eventValue: cubeDefinition.back.middle.middle,
					expected: { x: 0, y: 0, z: 1 }
				},
				{
					expectedString: "(-1, 0, 1)",
					whenObject: "back.middle.left",
					eventValue: cubeDefinition.back.middle.left,
					expected: { x: -1, y: 0, z: 1 }
				},
				{
					expectedString: "(-1, 0, -1)",
					whenObject: "back.middle.right",
					eventValue: cubeDefinition.front.middle.right,
					expected: { x: -1, y: 0, z: -1 }
				},

				{
					expectedString: "(0, 1, 1)",
					whenObject: "back.bottom.middle",
					eventValue: cubeDefinition.back.bottom.middle,
					expected: { x: 0, y: 1, z: 1 }
				},
				{
					expectedString: "(-1, 1, 1)",
					whenObject: "back.bottom.left",
					eventValue: cubeDefinition.back.bottom.left,
					expected: { x: -1, y: 1, z: 1 }
				},
				{
					expectedString: "(1, 1, 1)",
					whenObject: "back.bottom.right",
					eventValue: cubeDefinition.back.bottom.right,
					expected: { x: 1, y: 1, z: 1 }
				}
			]
		}

		const loopTests = [...generateFrontTests(), ...generateMiddleTests(), ...generateBackTests()]

		beforeEach(() => {
			threeOrbitControlsService.rotateCameraInVectorDirection = jest.fn()
			viewCubeComponent["cubeDefinition"] = cubeDefinition
		})

		for (const test of loopTests) {
			it(`should rotateCameraInVectorDirection with ${test.expectedString} when mesh is ${test.whenObject}`, () => {
				viewCubeComponent.onCubeClicked({ cube: test.eventValue })

				const expected = test.expected
				expect(threeOrbitControlsService.rotateCameraInVectorDirection).toHaveBeenCalledWith(expected.x, expected.y, expected.z)
			})
		}
	})
})
