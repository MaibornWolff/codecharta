import { CodeMapShaderStrings } from "./codeMapShaderStrings"
import { BuildResult, GeometryGenerator } from "./geometryGenerator"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Node, State } from "../../../codeCharta.model"
import { Camera, Mesh, Ray, ShaderMaterial, UniformsLib, UniformsUtils, Vector3 } from "three"
import { TreeMapHelper } from "../../../util/treeMapHelper"

export interface MousePos {
	x: number
	y: number
}

export class CodeMapMesh {
	public static readonly NUM_OF_COLOR_VECTOR_FIELDS = 3
	public static readonly NUM_OF_VERTICES = 24
	public static readonly LIGHTNESS_INCREASE = -10
	public static readonly LIGHTNESS_DECREASE = 20

	private threeMesh: Mesh
	private material: ShaderMaterial
	private geomGen: GeometryGenerator
	private mapGeomDesc: CodeMapGeometricDescription

	constructor(nodes: Node[], state: State, isDeltaState: boolean) {
		this.initMaterial()

		this.geomGen = new GeometryGenerator()
		const buildRes: BuildResult = this.geomGen.build(nodes, this.material, state, isDeltaState)

		this.threeMesh = buildRes.mesh
		this.mapGeomDesc = buildRes.desc

		this.initDeltaColorsOnMesh(state)
	}

	private initDeltaColorsOnMesh(state: State) {
		if (this.mapGeomDesc.buildings[0].node.deltas) {
			this.mapGeomDesc.buildings.forEach(building => {
				this.setNewDeltaColor(building, state)
				this.setVertexColor(building.id, building.getColorVector(), building.getDeltaColorVector())
			})
			this.updateVertices()
		}
	}

	public getThreeMesh(): Mesh {
		return this.threeMesh
	}

	public selectBuilding(building: CodeMapBuilding, selected: CodeMapBuilding, color: string) {
		building.setColor(color)
		this.setVertexColor(building.id, building.getColorVector(), building.getDefaultDeltaColorVector())
		this.updateVertices()
	}

	public clearSelection(selected: CodeMapBuilding) {
		selected.resetColor()
		this.setVertexColor(selected.id, selected.getDefaultColorVector(), selected.getDefaultDeltaColorVector())
		this.updateVertices()
	}

	public getMeshDescription(): CodeMapGeometricDescription {
		return this.mapGeomDesc
	}

	public getBuildingByPath(path: string): CodeMapBuilding {
		return this.mapGeomDesc.getBuildingByPath(path)
	}

	public checkMouseRayMeshIntersection(mouse: MousePos, camera: Camera): CodeMapBuilding {
		const ray: Ray = this.calculatePickingRay(mouse, camera)
		return this.getMeshDescription().intersect(ray)
	}

	public setScale(scale: Vector3) {
		this.mapGeomDesc.setScales(scale)
	}

	public highlightBuilding(highlightedBuildings: CodeMapBuilding[], selected: CodeMapBuilding, state: State) {
		const highlightBuildingMap = TreeMapHelper.buildingArrayToMap(highlightedBuildings)
		this.mapGeomDesc.buildings.forEach(building => {
			if (!this.isBuildingSelected(selected, building)) {
				if (highlightBuildingMap.get(building.id)) {
					building.decreaseLightness(CodeMapMesh.LIGHTNESS_INCREASE)
				} else {
					this.adjustSurroundingBuildingColors(highlightedBuildings, building, state)
				}
				this.setVertexColor(building.id, building.getColorVector(), building.getDeltaColorVector())
			}
		})
		this.updateVertices()
	}

	private adjustSurroundingBuildingColors(highlighted: CodeMapBuilding[], building: CodeMapBuilding, state: State) {
		const mapSize = state.treeMap.mapSize
		if (state.appSettings.isPresentationMode) {
			const distance = highlighted[0].getCenterPoint(mapSize).distanceTo(building.getCenterPoint(mapSize))
			this.decreaseLightnessByDistance(building, distance)
		} else {
			building.decreaseLightness(CodeMapMesh.LIGHTNESS_DECREASE)
		}
	}

	public clearHighlight(selected: CodeMapBuilding) {
		for (let i = 0; i < this.mapGeomDesc.buildings.length; i++) {
			const currentBuilding: CodeMapBuilding = this.mapGeomDesc.buildings[i]
			if (!this.isBuildingSelected(selected, currentBuilding)) {
				this.setVertexColor(
					currentBuilding.id,
					currentBuilding.getDefaultColorVector(),
					currentBuilding.getDefaultDeltaColorVector()
				)
			}
		}
		this.updateVertices()
	}

	private setNewDeltaColor(building: CodeMapBuilding, state: State) {
		if (building.node.deltas) {
			const deltaValue = building.node.deltas[state.dynamicSettings.heightMetric]

			if (deltaValue > 0) {
				building.setDeltaColor(state.appSettings.mapColors.positiveDelta)
			}

			if (deltaValue < 0) {
				building.setDeltaColor(state.appSettings.mapColors.negativeDelta)
			}
		}
	}

	private isBuildingSelected(selected: CodeMapBuilding, building: CodeMapBuilding) {
		return selected && building.equals(selected)
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

	private setVertexColor(id: number, newColorVector: Vector3, newDeltaColorVector) {
		const numberOfColorFieldsPerBuilding = CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS * CodeMapMesh.NUM_OF_VERTICES
		const positionOfFirstColorEntry = id * numberOfColorFieldsPerBuilding
		for (
			let j = positionOfFirstColorEntry;
			j < positionOfFirstColorEntry + numberOfColorFieldsPerBuilding;
			j += CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS
		) {
			this.threeMesh.geometry["attributes"].color.array[j] = newColorVector.x
			this.threeMesh.geometry["attributes"].color.array[j + 1] = newColorVector.y
			this.threeMesh.geometry["attributes"].color.array[j + 2] = newColorVector.z

			this.threeMesh.geometry["attributes"].deltaColor.array[j] = newDeltaColorVector.x
			this.threeMesh.geometry["attributes"].deltaColor.array[j + 1] = newDeltaColorVector.y
			this.threeMesh.geometry["attributes"].deltaColor.array[j + 2] = newDeltaColorVector.z
		}
	}

	private updateVertices() {
		this.threeMesh.geometry["attributes"].color.needsUpdate = true
		this.threeMesh.geometry["attributes"].deltaColor.needsUpdate = true
	}

	private initMaterial(): void {
		const uniforms = UniformsUtils.merge([UniformsLib["lights"]])

		const shaderCode: CodeMapShaderStrings = new CodeMapShaderStrings()

		this.material = new ShaderMaterial({
			vertexShader: shaderCode.vertexShaderCode,
			fragmentShader: shaderCode.fragmentShaderCode,
			lights: true,
			uniforms: uniforms
		})
	}

	private calculatePickingRay(mouse: MousePos, camera: Camera): Ray {
		const ray: Ray = new Ray()
		ray.origin.setFromMatrixPosition(camera.matrixWorld)
		ray.direction
			.set(mouse.x, mouse.y, 0.5)
			.unproject(camera)
			.sub(ray.origin)
			.normalize()

		return ray
	}
}
