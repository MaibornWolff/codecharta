import * as THREE from "three"
import { Node, Settings } from "../../../codeCharta.model"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { IntermediateVertexData } from "./intermediateVertexData"
import { BoxGeometryGenerationHelper } from "./boxGeometryGenerationHelper"
import { ColorConverter } from "../../../util/color/colorConverter"

export interface BoxMeasures {
	x: number
	y: number
	z: number
	width: number
	height: number
	depth: number
}

export interface BuildResult {
	mesh: THREE.Mesh
	desc: CodeMapGeometricDescription
}

export class GeometryGenerator {
	private static MINIMAL_BUILDING_HEIGHT = 1.0

	private floorGradient: string[]

	public build(nodes: Node[], material: THREE.Material, settings: Settings, isDeltaState: boolean): BuildResult {
		let data: IntermediateVertexData = new IntermediateVertexData()
		let desc: CodeMapGeometricDescription = new CodeMapGeometricDescription(settings.treeMapSettings.mapSize)

		this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))

		for (let i: number = 0; i < nodes.length; ++i) {
			let n: Node = nodes[i]

			if (!n.isLeaf) {
				this.addFloor(data, n, i, desc)
			} else {
				this.addBuilding(data, n, i, desc, settings, isDeltaState)
			}
		}

		return {
			mesh: this.buildMeshFromIntermediateVertexData(data, material),
			desc: desc
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
		let color = this.getMarkingColorWithGradient(n)
		let measures: BoxMeasures = this.mapNodeToLocalBox(n)

		desc.add(
			new CodeMapBuilding(
				idx,
				new THREE.Box3(
					new THREE.Vector3(measures.x, measures.y, measures.z),
					new THREE.Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
				),
				n,
				color
			)
		)

		BoxGeometryGenerationHelper.addBoxToVertexData(data, measures, color, idx, 0.0)
	}

	private getMarkingColorWithGradient(n: Node) {
		if (n.markingColor) {
			const markingColorAsNumber = ColorConverter.convertHexToNumber(n.markingColor)
			const markingColorWithGradient = markingColorAsNumber & (n.depth % 2 === 0 ? 0xdddddd : 0xffffff)
			return ColorConverter.convertNumberToHex(markingColorWithGradient)
		} else {
			return this.floorGradient[n.depth]
		}
	}

	private addBuilding(
		data: IntermediateVertexData,
		n: Node,
		idx: number,
		desc: CodeMapGeometricDescription,
		settings: Settings,
		isDeltaState: boolean
	): void {
		let measures: BoxMeasures = this.mapNodeToLocalBox(n)
		measures.height = this.ensureMinHeightIfUnlessDeltaNegative(n.height, n.heightDelta)

		let renderDelta: number = 0.0

		if (isDeltaState && n.deltas && n.deltas[settings.dynamicSettings.heightMetric] && n.heightDelta) {
			renderDelta = n.heightDelta //set the transformed render delta

			if (renderDelta < 0) {
				measures.height += Math.abs(renderDelta)
			}
		}

		desc.add(
			new CodeMapBuilding(
				idx,
				new THREE.Box3(
					new THREE.Vector3(measures.x, measures.y, measures.z),
					new THREE.Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
				),
				n,
				n.color
			)
		)

		BoxGeometryGenerationHelper.addBoxToVertexData(data, measures, n.color, idx, renderDelta)
	}

	private buildMeshFromIntermediateVertexData(data: IntermediateVertexData, material: THREE.Material): THREE.Mesh {
		let numVertices: number = data.positions.length
		const dimension: number = 3
		const uvDimension: number = 2

		let positions: Float32Array = new Float32Array(numVertices * dimension)
		let normals: Float32Array = new Float32Array(numVertices * dimension)
		let uvs: Float32Array = new Float32Array(numVertices * uvDimension)
		let colors: Float32Array = new Float32Array(numVertices * dimension)
		let deltaColors: Float32Array = new Float32Array(numVertices * dimension)
		let ids: Float32Array = new Float32Array(numVertices)
		let deltas: Float32Array = new Float32Array(numVertices)

		for (let i: number = 0; i < numVertices; ++i) {
			positions[i * dimension + 0] = data.positions[i].x
			positions[i * dimension + 1] = data.positions[i].y
			positions[i * dimension + 2] = data.positions[i].z

			normals[i * dimension + 0] = data.normals[i].x
			normals[i * dimension + 1] = data.normals[i].y
			normals[i * dimension + 2] = data.normals[i].z

			uvs[i * uvDimension + 0] = data.uvs[i].x
			uvs[i * uvDimension + 1] = data.uvs[i].y

			let color: THREE.Vector3 = ColorConverter.colorToVector3(data.colors[i])

			colors[i * dimension + 0] = color.x
			colors[i * dimension + 1] = color.y
			colors[i * dimension + 2] = color.z

			deltaColors[i * dimension + 0] = color.x
			deltaColors[i * dimension + 1] = color.y
			deltaColors[i * dimension + 2] = color.z

			ids[i] = data.subGeometryIdx[i]
			deltas[i] = data.deltas[i]
		}

		let indices: Uint32Array = new Uint32Array(data.indices.length)

		for (let i: number = 0; i < data.indices.length; ++i) {
			indices[i] = data.indices[i]
		}

		let geometry: THREE.BufferGeometry = new THREE.BufferGeometry()

		geometry.addAttribute("position", new THREE.BufferAttribute(positions, dimension))
		geometry.addAttribute("normal", new THREE.BufferAttribute(normals, dimension))
		geometry.addAttribute("uv", new THREE.BufferAttribute(uvs, uvDimension))
		geometry.addAttribute("color", new THREE.BufferAttribute(colors, dimension))
		geometry.addAttribute("deltaColor", new THREE.BufferAttribute(deltaColors, dimension))
		geometry.addAttribute("subGeomIdx", new THREE.BufferAttribute(ids, 1))
		geometry.addAttribute("delta", new THREE.BufferAttribute(deltas, 1))

		geometry.setIndex(new THREE.BufferAttribute(indices, 1))

		return new THREE.Mesh(geometry, material)
	}
}
