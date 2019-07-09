import * as THREE from "three"

import { CodeMapShaderStrings } from "./codeMapShaderStrings"
import { BuildResult, GeometryGenerator } from "./geometryGenerator"
import { CodeMapGeometricDescription, IntersectionResult } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Node, Settings } from "../../../codeCharta.model"
import { ColorConverter } from "../../../util/colorConverter"
import { Vector3 } from "three"
import convert from "color-convert"

interface ThreeUniform {
	type: string
	value: any
}

interface CodeMapLightingParams {
	numHighlights: ThreeUniform
	numSelections: ThreeUniform
	highlightColor: ThreeUniform
	highlightedIndices: ThreeUniform
	selectedColor: ThreeUniform
	selectedIndices: ThreeUniform
	emissive: ThreeUniform
	deltaColorPositive: ThreeUniform
	deltaColorNegative: ThreeUniform
}

export interface MousePos {
	x: number
	y: number
}

export class CodeMapMesh {
	private static readonly DIMENSIONS = 3
	private static readonly NUM_OF_VERTICES = 24

	public settings: Settings
	private threeMesh: THREE.Mesh
	private material: THREE.ShaderMaterial
	private geomGen: GeometryGenerator
	private mapGeomDesc: CodeMapGeometricDescription

	private nodes: Node[]

	private currentlyHighlighted: CodeMapBuilding[] | null
	private currentlySelected: CodeMapBuilding[] | null

	private lightingParams: CodeMapLightingParams = null

	constructor(nodes: Node[], settings: Settings, isDeltaState: boolean) {
		this.nodes = nodes
		this.initLightingParams(settings)
		this.initMaterial(settings)

		this.geomGen = new GeometryGenerator()
		let buildRes: BuildResult = this.geomGen.build(this.nodes, this.material, settings, isDeltaState)

		this.threeMesh = buildRes.mesh
		this.mapGeomDesc = buildRes.desc
		this.settings = settings
	}

	public getThreeMesh(): THREE.Mesh {
		return this.threeMesh
	}

	public setHighlighted(buildings: CodeMapBuilding[], color?: string) {
		/*
		this.material.uniforms.highlightedIndices.value = buildings.map((b: CodeMapBuilding) => {
			return b.id
		})
		this.material.uniforms.numHighlights.value = buildings.length

		if (color) {
			this.lightingParams.highlightColor.value = ColorConverter.colorToVector3(color)
		}

		this.currentlyHighlighted = buildings
*/
		const highlighted = buildings[0]

		for (
			let i = 0;
			i < this.mapGeomDesc.buildings.length * CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES;
			i += CodeMapMesh.DIMENSIONS
		) {
			const id = Math.floor(i / (CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES))
			const colors = this.threeMesh.geometry["attributes"].color
			const currentColor = new Vector3(colors.array[i], colors.array[i + 1], colors.array[i + 2])
			const building = this.mapGeomDesc.buildings.find(building => {
				return building.id === id
			})
			const distance = highlighted
				.getCenterOfBuilding(this.settings.treeMapSettings.mapSize)
				.distanceTo(building.getCenterOfBuilding(this.settings.treeMapSettings.mapSize))

			const r = Math.floor(currentColor.x * 255)
			const g = Math.floor(currentColor.y * 255)
			const b = Math.floor(currentColor.z * 255)

			const hsl = convert.rgb.hsl([r, g, b])

			if (id !== highlighted.id) {
				if (distance > 800) {
					hsl[2] -= 40
				} else if (distance > 400) {
					hsl[2] -= 30
				} else if (distance > 250) {
					hsl[2] -= 20
				} else if (distance > 100) {
					hsl[2] -= 15
				} else if (distance > 50) {
					hsl[2] -= 10
				}

				hsl[2] = hsl[2] < 0 ? 0 : hsl[2]
			} else {
				hsl[2] += 10
			}

			const hex = convert.hsl.hex([hsl[0], hsl[1], hsl[2]])
			const newColorVector = ColorConverter.colorToVector3(`#${hex}`)

			this.threeMesh.geometry["attributes"].color.array[i] = newColorVector.x
			this.threeMesh.geometry["attributes"].color.array[i + 1] = newColorVector.y
			this.threeMesh.geometry["attributes"].color.array[i + 2] = newColorVector.z
		}
		this.threeMesh.geometry["attributes"].color.needsUpdate = true
	}

	public setSelected(buildings: CodeMapBuilding[], color?: string) {
		this.material.uniforms.selectedIndices.value = buildings.map((b: CodeMapBuilding) => {
			return b.id
		})
		this.material.uniforms.numSelections.value = buildings.length

		if (color) {
			this.lightingParams.selectedColor.value = ColorConverter.colorToVector3(color)
		}

		this.currentlySelected = buildings
	}

	public getCurrentlyHighlighted(): CodeMapBuilding[] | null {
		return this.currentlyHighlighted
	}

	public getCurrentlySelected(): CodeMapBuilding[] | null {
		return this.currentlySelected
	}

	public clearHighlight() {
		this.material.uniforms.numHighlights.value = 0.0
		this.currentlyHighlighted = null
	}

	public clearSelected() {
		this.material.uniforms.numSelections.value = 0.0
		this.currentlySelected = null
	}

	public getMeshDescription(): CodeMapGeometricDescription {
		return this.mapGeomDesc
	}

	public checkMouseRayMeshIntersection(mouse: MousePos, camera: THREE.Camera): IntersectionResult {
		let ray: THREE.Ray = this.calculatePickingRay(mouse, camera)
		return this.getMeshDescription().intersect(ray)
	}

	public setScale(x: number, y: number, z: number) {
		this.mapGeomDesc.setScales(new THREE.Vector3(x, y, z))
	}

	private initLightingParams(settings: Settings) {
		this.lightingParams = {
			numHighlights: { type: "f", value: 0.0 },
			highlightColor: { type: "v3", value: ColorConverter.colorToVector3("#666666") },
			highlightedIndices: { type: "fv1", value: [] },
			numSelections: { type: "f", value: 0.0 },
			selectedColor: { type: "f", value: ColorConverter.colorToVector3(settings.appSettings.mapColors.selected) },
			selectedIndices: { type: "fv1", value: [] },

			deltaColorPositive: {
				type: "v3",
				value: ColorConverter.colorToVector3(settings.appSettings.mapColors.positiveDelta)
			},
			deltaColorNegative: {
				type: "v3",
				value: ColorConverter.colorToVector3(settings.appSettings.mapColors.negativeDelta)
			},

			emissive: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) }
		}
	}

	private initMaterial(settings: Settings): void {
		if (settings.appSettings.invertDeltaColors) {
			this.setInvertedDeltaColors(settings)
		} else {
			this.setDefaultDeltaColors(settings)
		}

		let uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib["lights"], this.lightingParams])

		let shaderCode: CodeMapShaderStrings = new CodeMapShaderStrings()

		this.material = new THREE.ShaderMaterial({
			vertexShader: shaderCode.vertexShaderCode,
			fragmentShader: shaderCode.fragmentShaderCode,
			lights: true,
			uniforms: uniforms
		})
	}

	private setInvertedDeltaColors(settings: Settings) {
		this.lightingParams.deltaColorPositive = {
			type: "v3",
			value: ColorConverter.colorToVector3(settings.appSettings.mapColors.negativeDelta)
		}
		this.lightingParams.deltaColorNegative = {
			type: "v3",
			value: ColorConverter.colorToVector3(settings.appSettings.mapColors.positiveDelta)
		}
	}

	private setDefaultDeltaColors(settings: Settings) {
		this.lightingParams.deltaColorPositive = {
			type: "v3",
			value: ColorConverter.colorToVector3(settings.appSettings.mapColors.positiveDelta)
		}
		this.lightingParams.deltaColorNegative = {
			type: "v3",
			value: ColorConverter.colorToVector3(settings.appSettings.mapColors.negativeDelta)
		}
	}

	private calculatePickingRay(mouse: MousePos, camera: THREE.Camera): THREE.Ray {
		let ray: THREE.Ray = new THREE.Ray()
		ray.origin.setFromMatrixPosition(camera.matrixWorld)
		ray.direction
			.set(mouse.x, mouse.y, 0.5)
			.unproject(camera)
			.sub(ray.origin)
			.normalize()

		return ray
	}
}
