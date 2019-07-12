import { CodeMapShaderStrings } from "./codeMapShaderStrings"
import { BuildResult, GeometryGenerator } from "./geometryGenerator"
import { CodeMapGeometricDescription, IntersectionResult } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Node, Settings } from "../../../codeCharta.model"
import { ColorConverter } from "../../../util/colorConverter"
import { Camera, Mesh, Ray, ShaderMaterial, UniformsLib, UniformsUtils, Vector3 } from "three"

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
	private static readonly NUM_OF_VERTICES = 8 * CodeMapMesh.DIMENSIONS

	public settings: Settings
	private threeMesh: Mesh
	private material: ShaderMaterial
	private geomGen: GeometryGenerator
	private mapGeomDesc: CodeMapGeometricDescription

	private nodes: Node[]
	private isFlashlightEnabled: boolean = false

	private currentlySelected: CodeMapBuilding[] = []

	private lightingParams: CodeMapLightingParams = null

	constructor(nodes: Node[], settings: Settings, isDeltaState: boolean) {
		this.nodes = nodes
		this.initLightingParams(settings)
		this.initMaterial(settings)

		this.geomGen = new GeometryGenerator()
		const buildRes: BuildResult = this.geomGen.build(this.nodes, this.material, settings, isDeltaState)

		this.threeMesh = buildRes.mesh
		this.mapGeomDesc = buildRes.desc
		this.settings = settings
	}

	public getThreeMesh(): Mesh {
		return this.threeMesh
	}

	public setFlashlightEnabled(isEnabled: boolean) {
		this.isFlashlightEnabled = isEnabled
	}

	public highlightBuilding(highlightedBuilding: CodeMapBuilding) {
		for (let i = 0; i < this.mapGeomDesc.buildings.length; i++) {
			const currentBuilding: CodeMapBuilding = this.mapGeomDesc.buildings[i]
			const distance = highlightedBuilding
				.getCenterPoint(this.settings.treeMapSettings.mapSize)
				.distanceTo(currentBuilding.getCenterPoint(this.settings.treeMapSettings.mapSize))

			if (currentBuilding.id !== highlightedBuilding.id) {
				if (this.isFlashlightEnabled) {
					this.decreaseLightnessByDistance(currentBuilding, distance)
				} else {
					currentBuilding.decreaseLightness(20)
				}
			} else {
				currentBuilding.decreaseLightness(-10)
			}
			this.setVertexColor(currentBuilding.id, currentBuilding.getColorVector())
		}
		this.updateVertices()
	}

	private decreaseLightnessByDistance(building: CodeMapBuilding, distance: number) {
		if (distance > 800) {
			building.decreaseLightness(40)
		} else if (distance > 400) {
			building.decreaseLightness(30)
		} else if (distance > 250) {
			building.decreaseLightness(20)
		} else if (distance > 100) {
			building.decreaseLightness(15)
		} else if (distance > 50) {
			building.decreaseLightness(10)
		}
	}

	private setVertexColor(id: number, newColorVector: Vector3) {
		for (
			let j = id * CodeMapMesh.NUM_OF_VERTICES * CodeMapMesh.DIMENSIONS;
			j < id * CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES + CodeMapMesh.DIMENSIONS * CodeMapMesh.NUM_OF_VERTICES;
			j += CodeMapMesh.DIMENSIONS
		) {
			this.threeMesh.geometry["attributes"].color.array[j] = newColorVector.x
			this.threeMesh.geometry["attributes"].color.array[j + 1] = newColorVector.y
			this.threeMesh.geometry["attributes"].color.array[j + 2] = newColorVector.z
		}
	}

	private updateVertices() {
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

	public clearHighlight() {
		for (let i = 0; i < this.mapGeomDesc.buildings.length; i++) {
			const currentBuilding: CodeMapBuilding = this.mapGeomDesc.buildings[i]
			this.setVertexColor(currentBuilding.id, currentBuilding.getDefaultColorVector())
		}
		this.updateVertices()
	}

	public clearSelected() {
		this.material.uniforms.numSelections.value = 0.0
		this.currentlySelected = null
	}

	public getMeshDescription(): CodeMapGeometricDescription {
		return this.mapGeomDesc
	}

	public checkMouseRayMeshIntersection(mouse: MousePos, camera: Camera): IntersectionResult {
		let ray: Ray = this.calculatePickingRay(mouse, camera)
		return this.getMeshDescription().intersect(ray)
	}

	public setScale(x: number, y: number, z: number) {
		this.mapGeomDesc.setScales(new Vector3(x, y, z))
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

			emissive: { type: "v3", value: new Vector3(0.0, 0.0, 0.0) }
		}
	}

	private initMaterial(settings: Settings): void {
		if (settings.appSettings.invertDeltaColors) {
			this.setInvertedDeltaColors(settings)
		} else {
			this.setDefaultDeltaColors(settings)
		}

		let uniforms = UniformsUtils.merge([UniformsLib["lights"], this.lightingParams])

		let shaderCode: CodeMapShaderStrings = new CodeMapShaderStrings()

		this.material = new ShaderMaterial({
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

	private calculatePickingRay(mouse: MousePos, camera: Camera): Ray {
		let ray: Ray = new Ray()
		ray.origin.setFromMatrixPosition(camera.matrixWorld)
		ray.direction
			.set(mouse.x, mouse.y, 0.5)
			.unproject(camera)
			.sub(ray.origin)
			.normalize()

		return ray
	}
}
