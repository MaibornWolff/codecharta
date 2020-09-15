import { CodeMapShaderStrings } from "./codeMapShaderStrings"
import { GeometryGenerator } from "./geometryGenerator"
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
	static readonly NUM_OF_COLOR_VECTOR_FIELDS = 3
	static readonly NUM_OF_VERTICES = 24
	static readonly LIGHTNESS_INCREASE = -10
	static readonly LIGHTNESS_DECREASE = 20

	private threeMesh: Mesh
	private material: ShaderMaterial
	private geomGen: GeometryGenerator
	private mapGeomDesc: CodeMapGeometricDescription

	constructor(nodes: Node[], state: State, isDeltaState: boolean) {
		this.initMaterial()

		this.geomGen = new GeometryGenerator()
		const buildResult = this.geomGen.build(nodes, this.material, state, isDeltaState)

		this.threeMesh = buildResult.mesh
		this.mapGeomDesc = buildResult.desc

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

	getThreeMesh() {
		return this.threeMesh
	}

	selectBuilding(building: CodeMapBuilding, color: string) {
		building.setColor(color)
		this.setVertexColor(building.id, building.getColorVector(), building.getDefaultDeltaColorVector())
		this.updateVertices()
	}

	clearSelection(selected: CodeMapBuilding) {
		selected.resetColor()
		this.setVertexColor(selected.id, selected.getDefaultColorVector(), selected.getDefaultDeltaColorVector())
		this.updateVertices()
	}

	getMeshDescription() {
		return this.mapGeomDesc
	}

	getBuildingByPath(path: string) {
		return this.mapGeomDesc.getBuildingByPath(path)
	}

	checkMouseRayMeshIntersection(mouse: MousePos, camera: Camera) {
		const ray = this.calculatePickingRay(mouse, camera)
		return this.getMeshDescription().intersect(ray)
	}

	setScale(scale: Vector3) {
		this.mapGeomDesc.setScales(scale)
	}

	highlightBuilding(highlightedBuildings: CodeMapBuilding[], selected: CodeMapBuilding, state: State) {
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
		const { mapSize } = state.treeMap
		if (state.appSettings.isPresentationMode) {
			const distance = highlighted[0].getCenterPoint(mapSize).distanceTo(building.getCenterPoint(mapSize))
			this.decreaseLightnessByDistance(building, distance)
		} else {
			building.decreaseLightness(CodeMapMesh.LIGHTNESS_DECREASE)
		}
	}

	clearHighlight(selected: CodeMapBuilding) {
		for (let i = 0; i < this.mapGeomDesc.buildings.length; i++) {
			const currentBuilding = this.mapGeomDesc.buildings[i]
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

	private initMaterial() {
		const uniforms = UniformsUtils.merge([UniformsLib["lights"]])

		const shaderCode: CodeMapShaderStrings = new CodeMapShaderStrings()

		this.material = new ShaderMaterial({
			vertexShader: shaderCode.vertexShaderCode,
			fragmentShader: shaderCode.fragmentShaderCode,
			lights: true,
			uniforms
		})
	}

	private calculatePickingRay(mouse: MousePos, camera: Camera) {
		const ray = new Ray()
		ray.origin.setFromMatrixPosition(camera.matrixWorld)
		ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(ray.origin).normalize()

		return ray
	}
}
