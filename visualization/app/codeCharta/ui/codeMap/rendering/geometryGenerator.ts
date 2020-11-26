import { Node, State } from "../../../codeCharta.model"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { IntermediateVertexData, SurfaceInformation } from "./intermediateVertexData"
import { BoxGeometryGenerationHelper } from "./boxGeometryGenerationHelper"
import { ColorConverter } from "../../../util/color/colorConverter"
import {
	Mesh,
	BufferGeometry,
	Material,
	Box3,
	Vector3,
	BufferAttribute,
	MeshBasicMaterial,
	CanvasTexture, RepeatWrapping, DoubleSide
} from "three"

export interface BoxMeasures {
	x: number
	y: number
	z: number
	width: number
	height: number
	depth: number
}

export interface BuildResult {
	mesh: Mesh
	desc: CodeMapGeometricDescription
}

export class GeometryGenerator {
	private static MINIMAL_BUILDING_HEIGHT = 1

	private floorGradient: string[]
	private materials: Material[]
	private floorSurfaceLabelFontSizes = [144, 98, 98]

	build(nodes: Node[], material: Material, state: State, isDeltaState: boolean): BuildResult {
		const data = new IntermediateVertexData()
		const desc = new CodeMapGeometricDescription(state.treeMap.mapSize)

		this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))
		this.materials = [material]

		// TODO: It is possible to significantly improve the overall drawing
		// performance by preventing intermediate transformations such as arrays
		// that are later on converted to typed arrays. Thus, no
		// `IntermediateVertexData` should be created.
		for (const [index, node] of nodes.entries()) {
			if (!node.isLeaf) {
				this.addFloor(data, node, index, desc)
			} else {
				this.addBuilding(data, node, index, desc, state, isDeltaState)
			}
		}

		return {
			mesh: this.buildMeshFromIntermediateVertexData(data),
			desc
		}
	}

	private getMaxNodeDepth(nodes: Node[]) {
		let max = 0
		nodes.forEach(node => {
			max = Math.max(node.depth, max)
		})
		return max
	}

	private mapNodeToLocalBox(node: Node): BoxMeasures {
		return {
			x: node.x0,
			y: node.z0,
			z: node.y0,
			width: node.width,
			height: node.height,
			depth: node.length
		}
	}

	private ensureMinHeightIfUnlessDeltaNegative(height: number, delta: number) {
		return delta <= 0 ? height : Math.max(height, GeometryGenerator.MINIMAL_BUILDING_HEIGHT)
	}

	private addFloor(data: IntermediateVertexData, node: Node, index: number, desc: CodeMapGeometricDescription) {
		const color = this.getMarkingColorWithGradient(node)
		const measures = this.mapNodeToLocalBox(node)

		desc.add(
			new CodeMapBuilding(
				index,
				new Box3(
					new Vector3(measures.x, measures.y, measures.z),
					new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
				),
				node,
				color
			)
		)

		BoxGeometryGenerationHelper.addBoxToVertexData(data, node, measures, color, index, 0, true)
	}

	private getMarkingColorWithGradient(node: Node) {
		if (node.markingColor) {
			const markingColorAsNumber = ColorConverter.getNumber(node.markingColor)
			const markingColorWithGradient = markingColorAsNumber & (node.depth % 2 === 0 ? 0xdddddd : 0xffffff)
			return ColorConverter.convertNumberToHex(markingColorWithGradient)
		}
		return this.floorGradient[node.depth]
	}

	private addBuilding(
		data: IntermediateVertexData,
		node: Node,
		index: number,
		desc: CodeMapGeometricDescription,
		state: State,
		isDeltaState: boolean
	)  {
		// return // hide buildings for debugging package label
		const measures = this.mapNodeToLocalBox(node)
		measures.height = this.ensureMinHeightIfUnlessDeltaNegative(node.height, node.heightDelta)

		let renderDelta = 0

		if (isDeltaState && node.deltas && node.deltas[state.dynamicSettings.heightMetric] && node.heightDelta) {
			renderDelta = node.heightDelta //set the transformed render delta

			if (renderDelta < 0) {
				measures.height += Math.abs(renderDelta)
			}
		}

		desc.add(
			new CodeMapBuilding(
				index,
				new Box3(
					new Vector3(measures.x, measures.y, measures.z),
					new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
				),
				node,
				node.color
			)
		)

		BoxGeometryGenerationHelper.addBoxToVertexData(data, node, measures, node.color, index, renderDelta)
	}

	private buildMeshFromIntermediateVertexData(data: IntermediateVertexData) {
		const numberVertices = data.positions.length
		const dimension = 3
		const uvDimension = 2
		const size = numberVertices * dimension

		const positions = new Float32Array(size)
		const normals = new Float32Array(size)
		const uvs = new Float32Array(numberVertices * uvDimension)
		const colors = new Float32Array(size)

		for (let index = 0; index < numberVertices; ++index) {
			const pos = index * dimension
			const pos1 = pos + 1
			const pos2 = pos1 + 1

			const dataPosition = data.positions[index]
			positions[pos] = dataPosition.x
			positions[pos1] = dataPosition.y
			positions[pos2] = dataPosition.z

			const dataNormal = data.normals[index]
			normals[pos] = dataNormal.x
			normals[pos1] = dataNormal.y
			normals[pos2] = dataNormal.z

			const uvPos = index * uvDimension
			uvs[uvPos] = data.uvs[index].x
			uvs[uvPos + 1] = data.uvs[index].y

			const color: Vector3 = ColorConverter.getVector3(data.colors[index])
			colors[pos] = color.x
			colors[pos1] = color.y
			colors[pos2] = color.z
		}

		const deltaColors = new Float32Array(colors)
		const indices = new Uint32Array(data.indices)
		const ids = new Float32Array(data.subGeometryIdx)
		const deltas = new Float32Array(data.deltas)

		const geometry = new BufferGeometry()

		geometry.setAttribute("position", new BufferAttribute(positions, dimension))
		geometry.setAttribute("normal", new BufferAttribute(normals, dimension))
		geometry.setAttribute("uv", new BufferAttribute(uvs, uvDimension))
		geometry.setAttribute("color", new BufferAttribute(colors, dimension))
		geometry.setAttribute("deltaColor", new BufferAttribute(deltaColors, dimension))
		geometry.setAttribute("subGeomIdx", new BufferAttribute(ids, 1))
		geometry.setAttribute("delta", new BufferAttribute(deltas, 1))

		geometry.setIndex(new BufferAttribute(indices, 1))

		// TODO: Find Top Face Vertices indexes dynamically
		//  Apply Geometry Group for these
		//  Calculate width and length of label plane texture from corresponding positions
		//geometry.addGroup(0, 18, 0)
	//geometry.addGroup(0, 54, 0)
		// 18-24 = top
		//geometry.addGroup(48, 12, 1)
		// floor surface root
		//geometry.addGroup(18, 6, 1)

		//geometry.addGroup(24, 30, 0)

		// floor surface ParentLeaf
	// geometry.addGroup(54, 6, 1)

	// geometry.addGroup(60, Infinity, 0)

		// const vertex1x = positions[(indices[18] - 1) * 3]
		// const vertex1y = positions[(indices[18] - 1) * 3 + 1]
		// const vertex1z = positions[(indices[18] - 1) * 3 + 2]
		// const vertex2x = positions[(indices[19] - 1) * 3]
		// const vertex2y = positions[(indices[19] - 1) * 3 + 1]
		// const vertex2z = positions[(indices[19] - 1) * 3 + 2]
		// const vertex3x = positions[(indices[20] - 1) * 3]
		// const vertex3y = positions[(indices[20] - 1) * 3 + 1]
		// const vertex3z = positions[(indices[20] - 1) * 3 + 2]
		// const vertex4x = positions[(indices[21] - 1) * 3]
		// const vertex4y = positions[(indices[21] - 1) * 3 + 1]
		// const vertex4z = positions[(indices[21] - 1) * 3 + 2]

		// console.log(vertex1x, vertex1y, vertex1z)
		// console.log(vertex2x, vertex2y, vertex2z)
		// console.log(vertex3x, vertex3y, vertex3z)
		// console.log(vertex4x, vertex4y, vertex4z)

		// const vertex5x = positions[(indices[54]) * 3 - 3]
		// const vertex5y = positions[(indices[54]) * 3 - 2]
		// const vertex5z = positions[(indices[54]) * 3 - 1]
		// const vertex6x = positions[(indices[55]) * 3 - 3]
		// const vertex6y = positions[(indices[55]) * 3 - 2]
		// const vertex6z = positions[(indices[55]) * 3 - 1]
		// const vertex7x = positions[(indices[56]) * 3 - 3]
		// const vertex7y = positions[(indices[56]) * 3 - 2]
		// const vertex7z = positions[(indices[56]) * 3 - 1]
		// const vertex8x = positions[(indices[57]) * 3 - 3]
		// const vertex8y = positions[(indices[57]) * 3 - 2]
		// const vertex8z = positions[(indices[57]) * 3 - 1]
		// console.log(vertex5x, vertex5y, vertex5z)
		// console.log(vertex6x, vertex6y, vertex6z)
		// console.log(vertex7x, vertex7y, vertex7z)
		// console.log(vertex8x, vertex8y, vertex8z)
		//
		// console.log(geometry)

		const topSurfaceInfos = data.floorSurfaceInformation

		geometry.addGroup(0, topSurfaceInfos[0].surfaceStartIndex, 0)

		const verticesPerPlane = 6
		for (let surfaceIndex = 0; surfaceIndex < topSurfaceInfos.length; surfaceIndex++) {
			const currentSurfaceInfo = topSurfaceInfos[surfaceIndex]
			geometry.addGroup(currentSurfaceInfo.surfaceStartIndex, verticesPerPlane, surfaceIndex + 1)

			this.createAndAssignFloorLabelTextureMaterial(currentSurfaceInfo)

			let verticesCountUntilNextFloorLabelRenderer = Infinity
			const startOfNextDefaultRenderer = currentSurfaceInfo.surfaceStartIndex + verticesPerPlane
			const nextSurfaceInfo = topSurfaceInfos[surfaceIndex + 1]


			if (nextSurfaceInfo) {
				verticesCountUntilNextFloorLabelRenderer = nextSurfaceInfo.surfaceStartIndex - startOfNextDefaultRenderer
			}
			geometry.addGroup(startOfNextDefaultRenderer, verticesCountUntilNextFloorLabelRenderer, 0)
		}

		return new Mesh(geometry, this.materials)
	}

	private createAndAssignFloorLabelTextureMaterial(surfaceInfo: SurfaceInformation) {
		const textCanvas = document.createElement("canvas");
		textCanvas.height = surfaceInfo.maxPos.x - surfaceInfo.minPos.x
		textCanvas.width = surfaceInfo.maxPos.z - surfaceInfo.minPos.z

		const context = textCanvas.getContext("2d")

		const fontSizeForDepth = this.floorSurfaceLabelFontSizes[surfaceInfo.node.depth - 1]
		context.font = `${fontSizeForDepth}px Arial`

		//context.fillStyle = surfaceIndex % 2 === 1 ? "orange" : "blue"
		context.fillStyle = this.getMarkingColorWithGradient(surfaceInfo.node)
		context.fillRect(0, 0, textCanvas.width, textCanvas.height)
		context.fillStyle = "white"
		context.textAlign = "center"
		context.textBaseline = "middle"

		const textPositionX = (textCanvas.width) / 2
		// consider font size for y position
		const textPositionY = textCanvas.height - fontSizeForDepth / 2

		context.fillText(surfaceInfo.node.name, textPositionX, textPositionY)

		const labelTexture = new CanvasTexture(textCanvas);
		labelTexture.image = textCanvas

		// Texture is mirrored (spiegelverkehrt)
		// Mirror it horizontally to fix that
		labelTexture.wrapS = RepeatWrapping
		labelTexture.repeat.x = - 1

		const floorSurfaceLabelMaterial = new MeshBasicMaterial({ map: labelTexture });
		floorSurfaceLabelMaterial.needsUpdate = true
		floorSurfaceLabelMaterial.side = DoubleSide
		floorSurfaceLabelMaterial.transparent = true

		this.materials.push(floorSurfaceLabelMaterial)
	}
}
