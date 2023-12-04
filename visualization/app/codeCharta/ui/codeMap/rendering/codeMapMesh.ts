import { CodeMapShaderStrings } from "./shaders/loaders/codeMapShaderStrings"
import { GeometryGenerator } from "./geometryGenerator"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { Node, Scaling, CcState } from "../../../codeCharta.model"
import { BufferAttribute, Camera, Mesh, Ray, ShaderMaterial, UniformsLib, UniformsUtils, Vector3 } from "three"
import { TreeMapHelper, treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"

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
	private nodes: Node[]

	constructor(nodes: Node[], state: CcState, isDeltaState: boolean) {
		this.initMaterial()

		this.geomGen = new GeometryGenerator()
		this.material.precision = "lowp" // no need for high precision in our shaders
		const buildResult = this.geomGen.build(nodes, this.material, state, isDeltaState)

		this.threeMesh = buildResult.mesh
		this.mapGeomDesc = buildResult.desc
		this.nodes = nodes

		this.initDeltaColorsOnMesh(state)
	}

	getThreeMesh() {
		return this.threeMesh
	}

	getNodes() {
		return this.nodes
	}

	selectBuilding(building: CodeMapBuilding, color: string) {
		building.setColor(color)
		building.setOnclickDeltaColor(color)
		this.setVertexColor(building.id, building.getColorVector(), building.getDeltaColorVector())
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

	setScale(scale: Scaling) {
		this.mapGeomDesc.setScales(scale)
	}

	highlightBuilding(
		highlightedBuildings: CodeMapBuilding[],
		selected: CodeMapBuilding,
		state: CcState,
		constantHighlight: Map<number, CodeMapBuilding>
	) {
		const highlightBuildingMap = TreeMapHelper.buildingArrayToMap(highlightedBuildings)
		for (const building of this.mapGeomDesc.buildings) {
			if (!this.isBuildingSelected(selected, building)) {
				if (highlightBuildingMap.get(building.id) || constantHighlight.get(building.id)) {
					building.decreaseLightness(CodeMapMesh.LIGHTNESS_INCREASE)
				} else {
					this.adjustSurroundingBuildingColors(highlightedBuildings, building, state)
				}
				this.setVertexColor(building.id, building.getColorVector(), building.getDeltaColorVector())
			}
		}
		this.updateVertices()
	}

	clearHighlight(selected: CodeMapBuilding) {
		for (const currentBuilding of this.mapGeomDesc.buildings) {
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

	private adjustSurroundingBuildingColors(highlighted: CodeMapBuilding[], building: CodeMapBuilding, state: CcState) {
		if (state.appSettings.isPresentationMode) {
			const distance = highlighted[0].getCenterPoint(treeMapSize).distanceTo(building.getCenterPoint(treeMapSize))
			this.decreaseLightnessByDistance(building, distance)
		} else {
			building.decreaseLightness(CodeMapMesh.LIGHTNESS_DECREASE)
		}
	}

	private initDeltaColorsOnMesh(state: CcState) {
		if (this.mapGeomDesc.buildings[0]?.node.deltas) {
			for (const building of this.mapGeomDesc.buildings) {
				this.setNewDeltaColor(building, state)
				this.setVertexColor(building.id, building.getColorVector(), building.getDeltaColorVector())
			}
			this.updateVertices()
		}
	}

	private setNewDeltaColor(building: CodeMapBuilding, state: CcState) {
		const {
			appSettings: { mapColors },
			dynamicSettings: { heightMetric }
		} = state
		const { node } = building

		if (node.flat) {
			building.setDeltaColor(mapColors.flat)
		} else if (node.deltas) {
			const deltaValue = node.deltas[heightMetric]

			if (deltaValue > 0) {
				building.setDeltaColor(mapColors.positiveDelta)
			}

			if (deltaValue < 0) {
				building.setDeltaColor(mapColors.negativeDelta)
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
		//!Note  this function is called a lot of times see highlightBuilding , maybe bulk update the color and delta colors
		const numberOfColorFieldsPerBuilding = CodeMapMesh.NUM_OF_VERTICES
		const positionOfFirstColorEntry = id * numberOfColorFieldsPerBuilding

		const colorAttribute = this.threeMesh.geometry.getAttribute("color") as BufferAttribute
		const deltaAttribute = this.threeMesh.geometry.getAttribute("deltaColor") as BufferAttribute

		for (let index = positionOfFirstColorEntry; index < positionOfFirstColorEntry + numberOfColorFieldsPerBuilding; index += 1) {
			colorAttribute.setXYZ(index, newColorVector.x, newColorVector.y, newColorVector.z)
			deltaAttribute.setXYZ(index, newDeltaColorVector.x, newDeltaColorVector.y, newDeltaColorVector.z)
		}

		//!Note this can be used to update only the needed range => faster rendering
		//!     maybe return the offset and count, build the union of the result, and
		//!     use next lines inside updateVertices ?

		/*colorAttribute.updateRange.offset = positionOfFirstColorEntry
		colorAttribute.updateRange.count = numberOfColorFieldsPerBuilding

		deltaAttribute.updateRange.offset = positionOfFirstColorEntry
		deltaAttribute.updateRange.count = numberOfColorFieldsPerBuilding*/
	}

	private updateVertices() {
		this.threeMesh.geometry.getAttribute("color").needsUpdate = true
		this.threeMesh.geometry.getAttribute("deltaColor").needsUpdate = true
	}

	dispose() {
		// TODO more needs to be disposed (textures, render targets, passes , ...)
		this.disposeMesh()
		this.disposeMaterial()
	}

	private disposeMesh() {
		this.threeMesh?.geometry?.dispose()
	}

	private disposeMaterial() {
		this.material?.dispose()
	}

	private initMaterial() {
		const uniforms = UniformsUtils.merge([UniformsLib["lights"]])

		const shaderCode = new CodeMapShaderStrings()

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
