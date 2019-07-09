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
	numSelections: ThreeUniform
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

	private currentlyHighlighted: string[] = []
	private currentlySelected: CodeMapBuilding[] = []

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

	public highlightBuilding(building: CodeMapBuilding) {
		for (
			let i = 0;
			i < this.mapGeomDesc.buildings.length * CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES;
			i += CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES
		) {
			const defaultColor = this.getDefaultColorByIndex(i)
			const currentBuilding = this.getBuildingByIndex(i)
			const distance = building
				.getCenterOfBuilding(this.settings.treeMapSettings.mapSize)
				.distanceTo(currentBuilding.getCenterOfBuilding(this.settings.treeMapSettings.mapSize))

			const newColorVector = this.removeLightnessFromColor(defaultColor, currentBuilding.id, building, distance)
			const rgb = ColorConverter.vector3ToRGB(defaultColor)
			this.currentlyHighlighted.push(`#${convert.rgb.hex([rgb.r, rgb.g, rgb.b])}`)
			this.setVertexColor(i, newColorVector)
		}
		this.threeMesh.geometry["attributes"].color.needsUpdate = true
	}

	private setVertexColor(i: number, newColorVector: Vector3) {
		for (let j = i; j < i + CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES; j += CodeMapMesh.DIMENSIONS) {
			this.threeMesh.geometry["attributes"].color.array[j] = newColorVector.x
			this.threeMesh.geometry["attributes"].color.array[j + 1] = newColorVector.y
			this.threeMesh.geometry["attributes"].color.array[j + 2] = newColorVector.z
		}
	}

	private getDefaultColorByIndex(index: number) {
		const colors = this.threeMesh.geometry["attributes"].defaultColor
		return new Vector3(colors.array[index], colors.array[index + 1], colors.array[index + 2])
	}

	private getBuildingByIndex(index: number): CodeMapBuilding {
		const id = Math.floor(index / (CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES))
		return this.mapGeomDesc.buildings[id]
	}

	private removeLightnessFromColor(currentColor, id, highlighted, distance): Vector3 {
		const rgb = ColorConverter.vector3ToRGB(currentColor)

		const hsl = convert.rgb.hsl([rgb.r, rgb.g, rgb.b])

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
		return ColorConverter.colorToVector3(`#${hex}`)
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

	public getCurrentlySelected(): CodeMapBuilding[] | null {
		return this.currentlySelected
	}

	public clearHighlight() {
		if (this.currentlyHighlighted.length > 1) {
			for (
				let i = 0;
				i < this.mapGeomDesc.buildings.length * CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES;
				i += CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES
			) {
				const originalColor = ColorConverter.colorToVector3(
					this.currentlyHighlighted[i / (CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES)]
				)

				this.setVertexColor(i, originalColor)
			}
			this.threeMesh.geometry["attributes"].color.needsUpdate = true
			this.currentlyHighlighted = []
		}
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
