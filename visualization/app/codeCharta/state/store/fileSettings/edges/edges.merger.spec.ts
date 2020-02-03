import { CCFile, Edge } from "../../../../codeCharta.model"
import { getMergedEdges } from "./edges.merger"
import { TEST_FILE_DATA } from "../../../../util/dataMocks"
import _ from "lodash"

describe("EdgesMerger", () => {
	describe("getMergedEdges", () => {
		let edge1: Edge
		let edge2: Edge
		let edge3: Edge
		let edge4: Edge

		let file1: CCFile
		let file2: CCFile

		beforeEach(() => {
			file1 = _.cloneDeep(TEST_FILE_DATA)
			file1.fileMeta.fileName = "file1"
			file1.settings.fileSettings.edges = []

			file2 = _.cloneDeep(TEST_FILE_DATA)
			file2.fileMeta.fileName = "file2"
			file2.settings.fileSettings.edges = []

			edge1 = {
				fromNodeName: "/root/nodeA",
				toNodeName: "/root/nodeB",
				attributes: {
					attribute1: 10,
					attribute2: 20
				}
			}

			edge2 = {
				fromNodeName: "/root/nodeA",
				toNodeName: "/root/nodeC",
				attributes: {
					attribute1: 10,
					attribute2: 20
				}
			}

			edge3 = {
				fromNodeName: "/root/nodeA",
				toNodeName: "/root/nodeB",
				attributes: {
					attribute3: 30,
					attribute4: 40
				}
			}

			edge4 = {
				fromNodeName: "/root/nodeA",
				toNodeName: "/root/nodeB",
				attributes: {
					attribute1: 70,
					attribute2: 80
				}
			}
		})

		it("should merge empty edges-arrays", () => {
			file1.settings.fileSettings.edges = []
			file2.settings.fileSettings.edges = []
			expect(getMergedEdges([file1, file2], false)).toEqual([])
		})

		it("should merge different edges", () => {
			file1.settings.fileSettings.edges = [edge1]
			file2.settings.fileSettings.edges = [edge2]
			expect(getMergedEdges([file1, file2], false)).toMatchSnapshot()
		})

		it("should merge all edges if one file does not contain edges", () => {
			file1.settings.fileSettings.edges = [edge1, edge2]
			file2.settings.fileSettings.edges = null
			expect(getMergedEdges([file1, file2], false)).toMatchSnapshot()
		})

		it("should merge edge-attributes for the same edge paths", () => {
			file1.settings.fileSettings.edges = [edge1]
			file2.settings.fileSettings.edges = [edge3]
			expect(getMergedEdges([file1, file2], false)).toMatchSnapshot()
		})

		it("should overwrite duplicated edge-attributes for the same edge", () => {
			file1.settings.fileSettings.edges = [edge1]
			file2.settings.fileSettings.edges = [edge4]
			expect(getMergedEdges([file1, file2], false)).toMatchSnapshot()
		})
	})
})
