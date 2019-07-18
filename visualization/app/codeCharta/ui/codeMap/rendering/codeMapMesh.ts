import { CodeMapShaderStrings } from "./codeMapShaderStrings"
import { BuildResult, GeometryGenerator } from "./geometryGenerator"
import { CodeMapGeometricDescription, IntersectionResult } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Node, Settings } from "../../../codeCharta.model"
import { Camera, Mesh, Ray, ShaderMaterial, UniformsLib, UniformsUtils, Vector3 } from "three"
import { ColorConverter } from "../../../util/color/colorConverter"

interface ThreeUniform {
	type: string
	value: any
}

interface CodeMapLightingParams {
	numSelections: ThreeUniform
	selectedColor: ThreeUniform
	selectedIndices: ThreeUniform
	deltaColorPositive: ThreeUniform
	deltaColorNegative: ThreeUniform
}

export interface MousePos {
	x: number
	y: number
}

export class CodeMapMesh {
	public static readonly NUM_OF_COLOR_VECTOR_FIELDS = 3
	public static readonly NUM_OF_VERTICES = 24

	public settings: Settings
	private threeMesh: Mesh
	private material: ShaderMaterial
	private geomGen: GeometryGenerator
	private mapGeomDesc: CodeMapGeometricDescription

	private nodes: Node[]
	private selected: CodeMapBuilding

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

	public selectBuilding(building: CodeMapBuilding, color: string) {
		building.setColor(color)
		this.setVertexColor(building.id, building.getColorVector())
		this.updateVertices()
		this.selected = building
	}

	public clearSelection() {
		this.selected.resetColor()
		this.setVertexColor(this.selected.id, this.selected.getDefaultColorVector())
		this.updateVertices()
		this.selected = null
	}

	public getMeshDescription(): CodeMapGeometricDescription {
		return this.mapGeomDesc
	}

	public checkMouseRayMeshIntersection(mouse: MousePos, camera: Camera): IntersectionResult {
		let ray: Ray = this.calculatePickingRay(mouse, camera)
		return this.getMeshDescription().intersect(ray)
	}

	public setScale(scale: Vector3) {
		this.mapGeomDesc.setScales(scale)
	}

	public highlightBuilding(highlightedBuilding: CodeMapBuilding, isPresentationMode: boolean, mapSize: number) {
		for (let i = 0; i < this.mapGeomDesc.buildings.length; i++) {
			const currentBuilding: CodeMapBuilding = this.mapGeomDesc.buildings[i]
			const distance = highlightedBuilding.getCenterPoint(mapSize).distanceTo(currentBuilding.getCenterPoint(mapSize))

			if (!this.isBuildingSelected(currentBuilding)) {
				if (!currentBuilding.equals(highlightedBuilding)) {
					if (isPresentationMode) {
						this.decreaseLightnessByDistance(currentBuilding, distance)
					} else {
						currentBuilding.decreaseLightness(20)
					}
				} else {
					currentBuilding.decreaseLightness(-10)
				}
			}
			this.setVertexColor(currentBuilding.id, currentBuilding.getColorVector())
		}
		this.updateVertices()
	}

	public clearHighlight() {
		for (let i = 0; i < this.mapGeomDesc.buildings.length; i++) {
			const currentBuilding: CodeMapBuilding = this.mapGeomDesc.buildings[i]
			if (!this.isBuildingSelected(currentBuilding)) {
				this.setVertexColor(currentBuilding.id, currentBuilding.getDefaultColorVector())
			}
		}
		this.updateVertices()
	}

	private isBuildingSelected(building: CodeMapBuilding) {
		return this.selected && building.equals(this.selected)
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
			let j = id * CodeMapMesh.NUM_OF_VERTICES * CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS;
			j <
			id * CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS * CodeMapMesh.NUM_OF_VERTICES +
				CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS * CodeMapMesh.NUM_OF_VERTICES;
			j += CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS
		) {
			this.threeMesh.geometry["attributes"].color.array[j] = newColorVector.x
			this.threeMesh.geometry["attributes"].color.array[j + 1] = newColorVector.y
			this.threeMesh.geometry["attributes"].color.array[j + 2] = newColorVector.z
		}
	}

	private updateVertices() {
		this.threeMesh.geometry["attributes"].color.needsUpdate = true
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
			}
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
