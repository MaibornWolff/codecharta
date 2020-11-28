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
	CanvasTexture,
	RepeatWrapping,
	DoubleSide
} from "three"
import { getMapResolutionScaleFactor, MAP_RESOLUTION_SCALE } from "../codeMap.render.service"

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
	private floorSurfaceLabelFontSizes = new Map([
		[MAP_RESOLUTION_SCALE.SMALL_MAP, [54, 54, 54]],
		[MAP_RESOLUTION_SCALE.MEDIUM_MAP, [72, 54, 54]],
		[MAP_RESOLUTION_SCALE.BIG_MAP, [108, 72, 72]]
	])
	private mapSizeResolutionScaling = MAP_RESOLUTION_SCALE.SMALL_MAP

	build(nodes: Node[], material: Material, state: State, isDeltaState: boolean): BuildResult {
		const data = new IntermediateVertexData()
		const desc = new CodeMapGeometricDescription(state.treeMap.mapSize)
		this.mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)

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
	) {
		const measures = this.mapNodeToLocalBox(node)
		measures.height = this.ensureMinHeightIfUnlessDeltaNegative(node.height, node.heightDelta)

		let renderDelta = 0

		if (isDeltaState && node.deltas && node.deltas[state.dynamicSettings.heightMetric] && node.heightDelta) {
			renderDelta = node.heightDelta //set the transformed render delta

			if (!node.flat && renderDelta < 0) {
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

		const topSurfaceInfos = data.floorSurfaceInformation
		if (topSurfaceInfos[0] === undefined) {
			// Add default group
			geometry.addGroup(0, Infinity, 0)
		} else {
			this.addMaterialGroups(data, geometry)
		}

		return new Mesh(geometry, this.materials)
	}

	private addMaterialGroups(data: IntermediateVertexData, geometry: BufferGeometry) {
		const topSurfaceInfos = data.floorSurfaceInformation

		// Render with default material until first floor surface
		geometry.addGroup(0, topSurfaceInfos[0].surfaceStartIndex, 0)

		// In general, a plane is rendered by 2 triangles, each with 3 vertices.
		const verticesPerPlane = 6

		for (let surfaceIndex = 0; surfaceIndex < topSurfaceInfos.length; surfaceIndex++) {
			const currentSurfaceInfo = topSurfaceInfos[surfaceIndex]
			// Render the floors surface with the text label texture
			geometry.addGroup(currentSurfaceInfo.surfaceStartIndex, verticesPerPlane, surfaceIndex + 1)

			this.createAndAssignFloorLabelTextureMaterial(currentSurfaceInfo)

			let verticesCountUntilNextFloorLabelRenderer = Infinity
			const startOfNextDefaultRenderer = currentSurfaceInfo.surfaceStartIndex + verticesPerPlane
			const nextSurfaceInfo = topSurfaceInfos[surfaceIndex + 1]

			if (nextSurfaceInfo) {
				verticesCountUntilNextFloorLabelRenderer = nextSurfaceInfo.surfaceStartIndex - startOfNextDefaultRenderer
			}

			// Render the remaining planes (sides, bottom) with the default material
			geometry.addGroup(startOfNextDefaultRenderer, verticesCountUntilNextFloorLabelRenderer, 0)
		}
	}

	private createAndAssignFloorLabelTextureMaterial(surfaceInfo: SurfaceInformation) {
		const textCanvas = document.createElement("canvas")
		textCanvas.height = surfaceInfo.maxPos.x - surfaceInfo.minPos.x
		textCanvas.width = surfaceInfo.maxPos.z - surfaceInfo.minPos.z

		const context = textCanvas.getContext("2d")
		context.fillStyle = this.getMarkingColorWithGradient(surfaceInfo.node)
		context.fillRect(0, 0, textCanvas.width, textCanvas.height)

		let labelText = surfaceInfo.node.name
		const fonSizesForMapSize = this.floorSurfaceLabelFontSizes.get(this.mapSizeResolutionScaling)
		const fontSizeForNodeDepth = fonSizesForMapSize[surfaceInfo.node.mapNodeDepth]
		context.font = `${fontSizeForNodeDepth}px Arial`

		const widthOfText = context.measureText(labelText)
		const fontScaleFactor = this.getFontScaleFactor(textCanvas.width, widthOfText.width)
		if (fontScaleFactor <= 0.5) {
			// Font will be to small.
			// So scale text not smaller than 0.5 and shorten it as well
			context.font = `${fontSizeForNodeDepth * 0.5}px Arial`
			labelText = this.getFittingLabelText(context, textCanvas.width, labelText, context.measureText(labelText).width)
		} else {
			context.font = `${fontSizeForNodeDepth * fontScaleFactor}px Arial`
		}

		context.fillStyle = "white"
		context.textAlign = "center"
		context.textBaseline = "middle"

		// consider font size for y position
		const textPositionY = textCanvas.height - fontSizeForNodeDepth / 2
		const textPositionX = textCanvas.width / 2

		context.fillText(labelText, textPositionX, textPositionY)

		const labelTexture = new CanvasTexture(textCanvas)
		// Texture is mirrored (spiegelverkehrt)
		// Mirror it horizontally to fix that
		labelTexture.wrapS = RepeatWrapping
		labelTexture.repeat.x = -1

		const floorSurfaceLabelMaterial = new MeshBasicMaterial({ map: labelTexture })
		floorSurfaceLabelMaterial.needsUpdate = true
		floorSurfaceLabelMaterial.side = DoubleSide
		floorSurfaceLabelMaterial.transparent = true
		floorSurfaceLabelMaterial.userData = surfaceInfo.node

		this.materials.push(floorSurfaceLabelMaterial)
	}

	private getFontScaleFactor(canvasWidth: number, widthOfText: number) {
		return widthOfText < canvasWidth ? 1 : canvasWidth / widthOfText
	}

	private getFittingLabelText(context: CanvasRenderingContext2D, canvasWidth: number, labelText: string, widthOfText: number) {
		let textSplitIndex = Math.floor((labelText.length * canvasWidth) / widthOfText)
		let abbreviatedText = `${labelText.slice(0, textSplitIndex)}...`

		while (context.measureText(abbreviatedText).width >= canvasWidth && textSplitIndex > 1) {
			// textSplitIndex > 1 to ensure it contains at least one char
			textSplitIndex -= 1
			abbreviatedText = `${labelText.slice(0, textSplitIndex)}...`
		}

		return abbreviatedText
	}
}
