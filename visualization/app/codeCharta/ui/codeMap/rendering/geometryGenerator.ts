import { Node, State } from "../../../codeCharta.model"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { addBoxToVertexData, IntermediateVertexData} from "./geometryGenerationHelper"
import { ColorConverter } from "../../../util/color/colorConverter"
import { Mesh, BufferGeometry, Material, BufferAttribute } from "three"

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
	/*private floorSurfaceLabelFontSizes = new Map([
		[MAP_RESOLUTION_SCALE.SMALL_MAP, [54, 54, 54]],
		[MAP_RESOLUTION_SCALE.MEDIUM_MAP, [72, 54, 54]],
		[MAP_RESOLUTION_SCALE.BIG_MAP, [108, 72, 72]]
	])
	 */
	//private mapSizeResolutionScaling = MAP_RESOLUTION_SCALE.SMALL_MAP

	build(nodes: Node[], material: Material, state: State, isDeltaState: boolean): BuildResult {
		const desc = new CodeMapGeometricDescription(state.treeMap.mapSize)
		//	this.mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)

		this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))
		this.materials = [material]

		const vertices = nodes.length
		const threeDimension = 3
		const twoDimension = 2
		const numberSides = 6
		const verticesPerSide = 4
		const size = vertices * verticesPerSide * numberSides

		const data: IntermediateVertexData = {
			positions: new Float32Array(size * threeDimension),
			uvs: new Float32Array(size * twoDimension),

			normals: new Float32Array(size * threeDimension),
			colors: new Float32Array(size * threeDimension),

			indices: new Uint32Array(vertices * numberSides * numberSides),
			ids: new Float32Array(size),

			deltas: new Float32Array(size),
			isHeight: new Float32Array(size)
		}

		for (const [index, node] of nodes.entries()) {
			if (!node.isLeaf) {
				this.addFloor(data, node, index, desc)
			} else {
				this.addBuilding(data, node, index, desc, state, isDeltaState)
			}
		}
		//console.log(this.floorSurfaceLabelFontSizes)
		//console.log(this.mapSizeResolutionScaling)

		return {
			mesh: this.buildMeshFromIntermediateVertexData(data),
			desc
		}
	}

	private getMaxNodeDepth(nodes: Node[]) {
		return nodes.reduce((max, { depth }) => Math.max(depth, max), 0)
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

	private ensureMinHeightUnlessDeltaIsNegative(height: number, delta: number) {
		return delta <= 0 ? height : Math.max(height, GeometryGenerator.MINIMAL_BUILDING_HEIGHT)
	}

	private addFloor(data: IntermediateVertexData, node: Node, index: number, desc: CodeMapGeometricDescription) {
		const color = this.getMarkingColorWithGradient(node)
		const measures = this.mapNodeToLocalBox(node)

		addBoxToVertexData(data, node, measures, color, index, desc, 0)
	}

	private getMarkingColorWithGradient(node: Node) {
		if (node.markingColor) {
			const markingColorAsNumber = ColorConverter.getNumber(node.markingColor)
			const markingColorWithGradient = markingColorAsNumber & (node.depth % 2 === 0 ? 0xdd_dd_dd : 0xff_ff_ff)
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
		measures.height = this.ensureMinHeightUnlessDeltaIsNegative(node.height, node.heightDelta)

		let renderDelta = 0

		if (isDeltaState && node.deltas && node.deltas[state.dynamicSettings.heightMetric] && node.heightDelta) {
			renderDelta = node.heightDelta // Set the transformed render delta

			if (!node.flat && renderDelta < 0) {
				measures.height += Math.abs(renderDelta)
			}
		}

		addBoxToVertexData(data, node, measures, node.color, index, desc, renderDelta)
	}

	private buildMeshFromIntermediateVertexData(data: IntermediateVertexData) {
		const threeDimensions = 3
		const twoDimensions = 2

		const deltaColors = new Float32Array(data.colors)

		const geometry = new BufferGeometry()

		geometry.setAttribute("position", new BufferAttribute(data.positions, threeDimensions))
		geometry.setAttribute("normal", new BufferAttribute(data.normals, threeDimensions))
		geometry.setAttribute("isHeight", new BufferAttribute(data.isHeight, 1))
		geometry.setAttribute("uv", new BufferAttribute(data.uvs, twoDimensions))
		geometry.setAttribute("color", new BufferAttribute(data.colors, threeDimensions))
		geometry.setAttribute("deltaColor", new BufferAttribute(deltaColors, threeDimensions))
		geometry.setAttribute("subGeomIdx", new BufferAttribute(data.ids, 1))
		geometry.setAttribute("delta", new BufferAttribute(data.deltas, 1))

		geometry.setIndex(new BufferAttribute(data.indices, 1))

		const topSurfaceInfos = data
		if (topSurfaceInfos[0] === undefined) {
			// Add default group
			geometry.addGroup(0, Number.POSITIVE_INFINITY, 0)
		} else {
			this.addMaterialGroups(data, geometry)
		}

		return new Mesh(geometry, this.materials)
	}

	private addMaterialGroups(data: IntermediateVertexData, geometry: BufferGeometry) {
		const topSurfaceInfos = data.indices

		// Render with default material until first floor surface
		geometry.addGroup(0, topSurfaceInfos[0], 0)

		// In general, a plane is rendered by 2 triangles, each with 3 vertices.
		const verticesPerPlane = 6

		for (let surfaceIndex = 0; surfaceIndex < topSurfaceInfos.length; surfaceIndex++) {
			const currentSurfaceInfo = topSurfaceInfos[surfaceIndex]
			// Render the floors surface with the text label texture
			geometry.addGroup(currentSurfaceInfo, verticesPerPlane, surfaceIndex + 1)

			//	this.createAndAssignFloorLabelTextureMaterial(currentSurfaceInfo)

			let verticesCountUntilNextFloorLabelRenderer = Number.POSITIVE_INFINITY
			const startOfNextDefaultRenderer = currentSurfaceInfo + verticesPerPlane
			const nextSurfaceInfo = topSurfaceInfos[surfaceIndex + 1]

			if (nextSurfaceInfo) {
				verticesCountUntilNextFloorLabelRenderer = nextSurfaceInfo - startOfNextDefaultRenderer
			}

			// Render the remaining planes (sides, bottom) with the default material
			geometry.addGroup(startOfNextDefaultRenderer, verticesCountUntilNextFloorLabelRenderer, 0)
		}
	}
	/*
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
		// TODO fontSizeForNodeDepth is the wrong font size to consider
		//  we must use the scaled font size instead.
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
		floorSurfaceLabelMaterial.transparent = false // perfromance killer, why do we need it ?, if necessary try out with shader ?
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
	*/
}
