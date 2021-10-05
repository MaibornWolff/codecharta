import { Node, State } from "../../../codeCharta.model"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { addBoxToVertexData, IntermediateVertexData, BoxMeasures } from "./geometryGenerationHelper"
import { ColorConverter } from "../../../util/color/colorConverter"
import {
	Mesh,
	BufferGeometry,
	Material,
	BufferAttribute
	//MeshBasicMaterial,
	//CanvasTexture,
	//DoubleSide,
	//RepeatWrapping
} from "three"
// import { getMapResolutionScaleFactor, MAP_RESOLUTION_SCALE } from "../../../util/codeMapHelper"

export interface BuildResult {
	mesh: Mesh
	desc: CodeMapGeometricDescription
}

export class GeometryGenerator {
	private static MINIMAL_BUILDING_HEIGHT = 1

	private floorGradient: string[]
	private materials: Material[]
	// private floorSurfaceLabelFontSizes = new Map([
	// 	[MAP_RESOLUTION_SCALE.SMALL_MAP, [54, 54, 54]],
	// 	[MAP_RESOLUTION_SCALE.MEDIUM_MAP, [72, 54, 54]],
	// 	[MAP_RESOLUTION_SCALE.BIG_MAP, [108, 72, 72]]
	// ])
	// private mapSizeResolutionScaling = MAP_RESOLUTION_SCALE.SMALL_MAP

	build(nodes: Node[], material: Material, state: State, isDeltaState: boolean): BuildResult {
		const desc = new CodeMapGeometricDescription(state.treeMap.mapSize)
		// this.mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)

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

		geometry.addGroup(0, Number.POSITIVE_INFINITY, 0)
		//this.addMaterialGroups(data, geometry)

		return new Mesh(geometry, this.materials)
	}

	// private addMaterialGroups(data: IntermediateVertexData, geometry: BufferGeometry) {
	// 	const topSurfaceInfos = data.floorSurfaceInformation
	//
	// 	// Render with default material until first floor surface
	// 	geometry.addGroup(0, Number.POSITIVE_INFINITY, 0)
	//
	// 	this.createAndAssignFloorLabelTextureMaterial(topSurfaceInfos)
	//
	// 	//const levelThreeSurfaces = topSurfaceInfos.get(2).values()
	//
	// 	const uvAttribute = geometry.attributes.uv
	// 	console.log("BLUB", uvAttribute)
	//
	// 	const u = uvAttribute.getX(361)
	// 	const v = uvAttribute.getY(361)
	// 	for (let i = 361; i < 365; i++) {
	// 		uvAttribute.setXY(i, 1 +  0.5, 1 + 0.5)
	// 		uvAttribute.needsUpdate = true
	// 	}
	//
	// 	console.log(u,v)
	//
	// 	geometry.addGroup(topSurfaceInfos.get(0).values().next().value.surfaceStartIndex, 6, 1)
	// 	geometry.addGroup(topSurfaceInfos.get(1).values().next().value.surfaceStartIndex, 6, 2)
	// 	geometry.addGroup(342, 6, 3)
	//
	// 	//geometry.addGroup(levelThreeSurfaces.next().value.surfaceStartIndex, 6, 3)
	// 	//geometry.addGroup(levelThreeSurfaces.next().value.surfaceStartIndex, 6, 3)
	//
	// 	// geometry.addGroup(0, topSurfaceInfos[0].surfaceStartIndex, 1)
	//
	// 	// // In general, a plane is rendered by 2 triangles, each with 3 vertices.
	// 	// const verticesPerPlane = 6
	//
	// 	// for (let surfaceIndex = 0; surfaceIndex < topSurfaceInfos.length; surfaceIndex++) {
	// 	// 	const currentSurfaceInfo = topSurfaceInfos[surfaceIndex]
	// 	// 	// Render the floors surface with the text label texture
	// 	// 	geometry.addGroup(currentSurfaceInfo.surfaceStartIndex, verticesPerPlane, surfaceIndex + 1)
	//
	// 	// 	this.createAndAssignFloorLabelTextureMaterial(topSurfaceInfos)
	//
	// 	// 	let verticesCountUntilNextFloorLabelRenderer = Number.POSITIVE_INFINITY
	// 	// 	const startOfNextDefaultRenderer = currentSurfaceInfo.surfaceStartIndex + verticesPerPlane
	// 	// 	const nextSurfaceInfo = topSurfaceInfos[surfaceIndex + 1]
	//
	// 	// 	if (nextSurfaceInfo) {
	// 	// 		verticesCountUntilNextFloorLabelRenderer = nextSurfaceInfo.surfaceStartIndex - startOfNextDefaultRenderer
	// 	// 	}
	//
	// 	// 	// Render the remaining planes (sides, bottom) with the default material
	// 	// 	geometry.addGroup(startOfNextDefaultRenderer, verticesCountUntilNextFloorLabelRenderer, 0)
	// 	// }
	// }

	// private createAndAssignFloorLabelTextureMaterial(surfaceInfos: Map<number, SurfaceInformation[]>) {
	// 	//// @ts-expect-error no TypeScript information available.
	// 	const canvases = document.getElementsByTagName("canvas")
	// 	//const { height, width } = canvases[canvases.length - 1]
	//
	// 	console.log(canvases[canvases.length - 1].width, canvases[canvases.length - 1].height)
	// 	console.log(canvases[canvases.length - 1], canvases.length)
	//
	// 	const codeMapCanvas = canvases[canvases.length - 1]
	//
	// 	console.log(surfaceInfos.values())
	// 	for (const surfacesPerLevel of surfaceInfos.values()) {
	// 		const textCanvas = document.createElement("canvas")
	// 		textCanvas.height = codeMapCanvas.height
	// 		textCanvas.width = codeMapCanvas.width
	//
	//
	// 		const context = textCanvas.getContext("2d")
	// 		// context.fillStyle = this.getMarkingColorWithGradient(surfaceInfos[0].node)
	// 		// context.fillRect(0, 0, textCanvas.width, textCanvas.height)
	//
	// 		context.fillStyle = "black"
	// 		context.textAlign = "center"
	// 		context.textBaseline = "middle"
	// 		// context.rotate(Math.PI);
	//
	// 		for (const {
	// 			node,
	// 			minPos,
	// 			maxPos
	// 		} of surfacesPerLevel) {
	// 			const surfaceWidth = maxPos.z - minPos.z
	//
	// 			const {labelText, fontSize} = this.getLabelAndSetContextFont(node.name, context, surfaceWidth)
	//
	// 			context.font = `${fontSize}px Arial`
	//
	// 			//const textPositionY = maxPos.x - 5
	//
	// 			console.log(node)
	// 			const textPositionX = node.y0
	// 			const textPositionY = node.x0
	//
	// 			// Consider font size for y position
	// 			//const textWidth = maxPos.y - minPos.y
	// 		//const textPositionX = (maxPos.z - minPos.z) / 2
	// 			//const textPositionX = textWidth / 2 + minPos.y
	//
	//
	// 			// ctx.translate(150, 75);
	// 			// ctx.rotate(Math.PI / 2);
	// 			// ctx.translate(-150, -75);
	//
	// 			// TODO: Consider using the 4th argument (maxWidth to limit the labelText instead of changing the font size etc.)
	// 			context.fillText(labelText, textPositionX, textPositionY)
	// 		}
	//
	// 		const labelTexture = new CanvasTexture(textCanvas)
	// 		labelTexture.wrapS = RepeatWrapping
	// 		labelTexture.wrapT = RepeatWrapping
	// 		labelTexture.needsUpdate = true
	//
	// 		// Texture is mirrored (spiegelverkehrt)
	// 		// Mirror it horizontally to fix that
	// 		// TODO: Fix this. It should be possible to rotate the context appropriately.
	// 		//labelTexture.wrapS = RepeatWrapping
	// 		//labelTexture.repeat.set(1, 1);
	//
	// 		const floorSurfaceLabelMaterial = new MeshBasicMaterial({ map: labelTexture })
	// 		// floorSurfaceLabelMaterial.needsUpdate = true
	// 		floorSurfaceLabelMaterial.side = DoubleSide
	// 		floorSurfaceLabelMaterial.transparent = true
	// 		// floorSurfaceLabelMaterial.userData = surfaceInfo.node
	//
	// 		//document.body.prepend(textCanvas)
	// 		console.log("TEXTCANVAS", textCanvas)
	// 		this.materials.push(floorSurfaceLabelMaterial)
	// 	}
	// }
}
