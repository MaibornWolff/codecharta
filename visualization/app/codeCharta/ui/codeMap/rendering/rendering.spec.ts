import { IntermediateVertexData } from "./intermediateVertexData"
import * as THREE from "three"
import { CodeMapShaderStrings } from "./codeMapShaderStrings"

describe("common rendering tests", () => {
	describe("shader strings", () => {
		it("init", () => {
			let cmss: CodeMapShaderStrings = new CodeMapShaderStrings()
			expect(cmss.fragmentShaderCode).toMatchSnapshot()
			expect(cmss.vertexShaderCode).toMatchSnapshot()
		})
	})

	describe("intermediate vertex data", () => {
		it("addFace", () => {
			let ivd: IntermediateVertexData = new IntermediateVertexData()
			ivd.addFace(0, 1, 2)
			expect(ivd.indices.length).toBe(3)
			expect(ivd.indices).toEqual([0, 1, 2])
			ivd.addFace(2, 3, 7)
			expect(ivd.indices.length).toBe(6)
			expect(ivd.indices).toEqual([0, 1, 2, 2, 3, 7])
		})

		it("addVertex", () => {
			let ivd: IntermediateVertexData = new IntermediateVertexData()
			let res = ivd.addVertex(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector2(2, 2), "#000000", 3, 20)
			expect(ivd.indices.length).toBe(0)
			expect(ivd.positions.length).toBe(1)
			expect(ivd.normals.length).toBe(1)
			expect(ivd.uvs.length).toBe(1)
			expect(ivd.colors.length).toBe(1)
			expect(ivd.subGeometryIdx.length).toBe(1)
			expect(ivd.deltas.length).toBe(1)
			expect(res).toBe(0)
		})
	})
})
