import { Node, CcState } from "../../../codeCharta.model"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { addBoxToVertexData, IntermediateVertexData, BoxMeasures } from "./geometryGenerationHelper"
import { ColorConverter } from "../../../util/color/colorConverter"
import { Mesh, BufferGeometry, Material, BufferAttribute } from "three"
import { treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"

export interface BuildResult {
	mesh: Mesh
	desc: CodeMapGeometricDescription
}

export class GeometryGenerator {
	private static MINIMAL_BUILDING_HEIGHT = 1

	private floorGradient: string[]
	private materials: Material[]

	build(nodes: Node[], material: Material, state: CcState, isDeltaState: boolean): BuildResult {
		const desc = new CodeMapGeometricDescription(treeMapSize)

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
		state: CcState,
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

		return new Mesh(geometry, this.materials)
	}
}
