import { Node, State } from "../../../codeCharta.model"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { IntermediateVertexData } from "./intermediateVertexData"
import { BoxGeometryGenerationHelper } from "./boxGeometryGenerationHelper"
import { ColorConverter } from "../../../util/color/colorConverter"
import { Mesh, BufferGeometry, Material, Box3, Vector3, BufferAttribute } from "three"

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
	private static MINIMAL_BUILDING_HEIGHT = 1.0

	private floorGradient: string[]

	public build(nodes: Node[], material: Material, state: State, isDeltaState: boolean): BuildResult {
		const data: IntermediateVertexData = new IntermediateVertexData()
		const desc: CodeMapGeometricDescription = new CodeMapGeometricDescription(state.treeMap.mapSize)

		this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))

		// TODO: It is possible to significantly improve the overall drawing
		// performance by preventing intermediate transformations such as arrays
		// that are later on converted to typed arrays. Thus, no
		// `IntermediateVertexData` should be created.
		for (let i = 0; i < nodes.length; ++i) {
			const n: Node = nodes[i]

			if (!n.isLeaf) {
				this.addFloor(data, n, i, desc)
			} else {
				this.addBuilding(data, n, i, desc, state, isDeltaState)
			}
		}

		return {
			mesh: this.buildMeshFromIntermediateVertexData(data, material),
			desc
		}
	}

	private getMaxNodeDepth(nodes: Node[]): number {
		let max = 0
		nodes.forEach(node => {
			max = Math.max(node.depth, max)
		})
		return max
	}

	private mapNodeToLocalBox(n: Node): BoxMeasures {
		return {
			x: n.x0,
			y: n.z0,
			z: n.y0,
			width: n.width,
			height: n.height,
			depth: n.length
		}
	}

	private ensureMinHeightIfUnlessDeltaNegative(height: number, delta: number): number {
		return delta <= 0 ? height : Math.max(height, GeometryGenerator.MINIMAL_BUILDING_HEIGHT)
	}

	private addFloor(data: IntermediateVertexData, n: Node, idx: number, desc: CodeMapGeometricDescription) {
		const color = this.getMarkingColorWithGradient(n)
		const measures: BoxMeasures = this.mapNodeToLocalBox(n)

		desc.add(
			new CodeMapBuilding(
				idx,
				new Box3(
					new Vector3(measures.x, measures.y, measures.z),
					new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
				),
				n,
				color
			)
		)

		BoxGeometryGenerationHelper.addBoxToVertexData(data, measures, color, idx, 0.0)
	}

	private getMarkingColorWithGradient(n: Node) {
		if (n.markingColor) {
			const markingColorAsNumber = ColorConverter.getNumber(n.markingColor)
			const markingColorWithGradient = markingColorAsNumber & (n.depth % 2 === 0 ? 0xdddddd : 0xffffff)
			return ColorConverter.convertNumberToHex(markingColorWithGradient)
		}
		return this.floorGradient[n.depth]
	}

	private addBuilding(
		data: IntermediateVertexData,
		n: Node,
		idx: number,
		desc: CodeMapGeometricDescription,
		state: State,
		isDeltaState: boolean
	): void {
		const measures: BoxMeasures = this.mapNodeToLocalBox(n)
		measures.height = this.ensureMinHeightIfUnlessDeltaNegative(n.height, n.heightDelta)

		let renderDelta = 0.0

		if (isDeltaState && n.deltas && n.deltas[state.dynamicSettings.heightMetric] && n.heightDelta) {
			renderDelta = n.heightDelta //set the transformed render delta

			if (renderDelta < 0) {
				measures.height += Math.abs(renderDelta)
			}
		}

		desc.add(
			new CodeMapBuilding(
				idx,
				new Box3(
					new Vector3(measures.x, measures.y, measures.z),
					new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
				),
				n,
				n.color
			)
		)

		BoxGeometryGenerationHelper.addBoxToVertexData(data, measures, n.color, idx, renderDelta)
	}

	private buildMeshFromIntermediateVertexData(data: IntermediateVertexData, material: Material): Mesh {
		const numVertices = data.positions.length
		const dimension = 3
		const uvDimension = 2
		const size = numVertices * dimension

		const positions: Float32Array = new Float32Array(size)
		const normals: Float32Array = new Float32Array(size)
		const uvs: Float32Array = new Float32Array(numVertices * uvDimension)
		const colors: Float32Array = new Float32Array(size)

		for (let i = 0; i < numVertices; ++i) {
			const pos = i * dimension
			const pos1 = pos + 1
			const pos2 = pos1 + 1

			const dataPosition = data.positions[i]
			positions[pos] = dataPosition.x
			positions[pos1] = dataPosition.y
			positions[pos2] = dataPosition.z

			const dataNormal = data.normals[i]
			normals[pos] = dataNormal.x
			normals[pos1] = dataNormal.y
			normals[pos2] = dataNormal.z

			const uvPos = i * uvDimension
			uvs[uvPos] = data.uvs[i].x
			uvs[uvPos + 1] = data.uvs[i].y

			const color: Vector3 = ColorConverter.getVector3(data.colors[i])
			colors[pos] = color.x
			colors[pos1] = color.y
			colors[pos2] = color.z
		}

		const deltaColors: Float32Array = new Float32Array(colors)
		const indices: Uint32Array = new Uint32Array(data.indices)
		const ids: Float32Array = new Float32Array(data.subGeometryIdx)
		const deltas: Float32Array = new Float32Array(data.deltas)

		const geometry: BufferGeometry = new BufferGeometry()

		geometry.setAttribute("position", new BufferAttribute(positions, dimension))
		geometry.setAttribute("normal", new BufferAttribute(normals, dimension))
		geometry.setAttribute("uv", new BufferAttribute(uvs, uvDimension))
		geometry.setAttribute("color", new BufferAttribute(colors, dimension))
		geometry.setAttribute("deltaColor", new BufferAttribute(deltaColors, dimension))
		geometry.setAttribute("subGeomIdx", new BufferAttribute(ids, 1))
		geometry.setAttribute("delta", new BufferAttribute(deltas, 1))

		geometry.setIndex(new BufferAttribute(indices, 1))

		return new Mesh(geometry, material)
	}
}
