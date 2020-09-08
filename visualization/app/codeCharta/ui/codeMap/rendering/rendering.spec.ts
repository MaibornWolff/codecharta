import { IntermediateVertexData } from "./intermediateVertexData"
import { CodeMapShaderStrings } from "./codeMapShaderStrings"
import { Vector2, Vector3 } from "three"

describe("common rendering tests", () => {
	describe("shader strings", () => {
		it("init", () => {
			const cmss: CodeMapShaderStrings = new CodeMapShaderStrings()
			expect(cmss.fragmentShaderCode).toMatchSnapshot()
			expect(cmss.vertexShaderCode).toMatchSnapshot()
		})
	})

	describe("intermediate vertex data", () => {
		it("addFace", () => {
			const ivd: IntermediateVertexData = new IntermediateVertexData()
			ivd.addFace(0, 1, 2)
			expect(ivd.indices.length).toBe(3)
			expect(ivd.indices).toEqual([0, 1, 2])
			ivd.addFace(2, 3, 7)
			expect(ivd.indices.length).toBe(6)
			expect(ivd.indices).toEqual([0, 1, 2, 2, 3, 7])
		})

		it("addVertex", () => {
			const ivd: IntermediateVertexData = new IntermediateVertexData()
			const res = ivd.addVertex(new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector2(2, 2), "#000000", 3, 20)
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
