import {
	AttributeTypeValue,
	BlacklistItem,
	BlacklistType,
	CCFile,
	Edge,
	FileSettings,
	MarkedPackage,
	AttributeTypes
} from "../codeCharta.model"
import { SettingsMerger } from "./settingsMerger"

describe("SettingsMerger", () => {
	const file1: CCFile = {
		fileMeta: {
			fileName: "file1",
			projectName: "Sample Project",
			apiVersion: "1.1"
		},
		map: {
			name: "root",
			type: "Folder",
			attributes: {},
			children: []
		},
		settings: {
			fileSettings: {
				edges: [],
				blacklist: [],
				markedPackages: [],
				attributeTypes: { nodes: [], edges: [] }
			}
		}
	}

	const file2: CCFile = {
		fileMeta: {
			fileName: "file2",
			projectName: "Sample Project",
			apiVersion: "1.1"
		},
		map: {
			name: "root",
			type: "Folder",
			attributes: {},
			children: []
		},
		settings: {
			fileSettings: {
				edges: [],
				blacklist: [],
				markedPackages: [],
				attributeTypes: { nodes: [], edges: [] }
			}
		}
	}

	describe("MarkedPackages merge", () => {
		let mp1: MarkedPackage
		let mp2: MarkedPackage
		let mp3: MarkedPackage
		let mp4: MarkedPackage

		beforeEach(() => {
			mp1 = {
				path: "/root/nodeA",
				color: "#ABABAB",
				attributes: {
					name: "nodeA"
				}
			}

			mp2 = {
				path: "/root/nodeB",
				color: "#FFFFFF",
				attributes: {
					name: "nodeB"
				}
			}

			mp3 = {
				path: "/root/nodeA",
				color: "#ABABAB",
				attributes: {
					another: "nodeA"
				}
			}

			mp4 = {
				path: "/root/nodeA",
				color: "#ABABAB",
				attributes: {
					name: "overwrite nodeA"
				}
			}
		})

		it("should merge empty markedPackage-arrays", () => {
			file1.settings.fileSettings.markedPackages = []
			file2.settings.fileSettings.markedPackages = []
			const fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.markedPackages).toEqual([])
		})

		it("should merge different markedPackages", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp2]
			const fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.markedPackages).toMatchSnapshot()
		})

		it("should merge all markedPackages if one file does not contain markedPackages", () => {
			file1.settings.fileSettings.markedPackages = [mp1, mp2]
			file2.settings.fileSettings.markedPackages = null
			const fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.markedPackages).toMatchSnapshot()
		})

		it("should merge markedPackage-attributes for the same markedPackage paths", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp3]
			const fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.markedPackages).toMatchSnapshot()
		})

		it("should overwrite duplicated markedPackage-attributes for the same markedPackage", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp4]
			const fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.markedPackages).toMatchSnapshot()
		})
	})

	describe("Edges merge", () => {
		let edge1: Edge
		let edge2: Edge
		let edge3: Edge
		let edge4: Edge

		beforeEach(() => {
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
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.edges).toEqual([])
		})

		it("should merge different edges", () => {
			file1.settings.fileSettings.edges = [edge1]
			file2.settings.fileSettings.edges = [edge2]
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.edges).toMatchSnapshot()
		})

		it("should merge all edges if one file does not contain edges", () => {
			file1.settings.fileSettings.edges = [edge1, edge2]
			file2.settings.fileSettings.edges = null
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.edges).toMatchSnapshot()
		})

		it("should merge edge-attributes for the same edge paths", () => {
			file1.settings.fileSettings.edges = [edge1]
			file2.settings.fileSettings.edges = [edge3]
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.edges).toMatchSnapshot()
		})

		it("should overwrite duplicated edge-attributes for the same edge", () => {
			file1.settings.fileSettings.edges = [edge1]
			file2.settings.fileSettings.edges = [edge4]
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.edges).toMatchSnapshot()
		})
	})

	describe("AttributeTypes merge", () => {
		let attributes1: AttributeTypes
		let attributes2: AttributeTypes
		let attributes3: AttributeTypes

		beforeEach(() => {
			attributes1 = {
				nodes: [
					{
						attribute1: AttributeTypeValue.absolute
					}
				],
				edges: [
					{
						attribute2: AttributeTypeValue.relative
					}
				]
			}

			attributes2 = {
				nodes: [
					{
						attribute3: AttributeTypeValue.absolute
					}
				],
				edges: [
					{
						attribute4: AttributeTypeValue.relative
					}
				]
			}

			attributes3 = {
				nodes: [
					{
						attribute1: AttributeTypeValue.relative
					}
				],
				edges: []
			}
		})

		it("should merge different attributeTypes", () => {
			file1.settings.fileSettings.attributeTypes = attributes1
			file2.settings.fileSettings.attributeTypes = attributes2
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.attributeTypes).toMatchSnapshot()
		})

		it("should merge attributeTypes if one file does not contain attributeTypes", () => {
			file1.settings.fileSettings.attributeTypes = attributes1
			file2.settings.fileSettings.attributeTypes = { nodes: [], edges: [] }
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.attributeTypes).toMatchSnapshot()
		})

		it("should only contain unique attributeType keys", () => {
			file1.settings.fileSettings.attributeTypes = attributes1
			file2.settings.fileSettings.attributeTypes = attributes3
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.attributeTypes).toMatchSnapshot()
		})
	})

	describe("Blacklist merge", () => {
		const blacklistItem1: BlacklistItem = { path: "/root/nodeA", type: BlacklistType.exclude }
		const blacklistItem2: BlacklistItem = { path: "/another/nodeB", type: BlacklistType.flatten }
		const blacklistItem3: BlacklistItem = { path: "/another/nodeC", type: BlacklistType.exclude }
		const blacklistItem4: BlacklistItem = { path: "*prefix/nodeD", type: BlacklistType.flatten }
		const blacklistItem1Duplicate: BlacklistItem = { path: "/root/nodeA", type: BlacklistType.exclude }

		it("should merge blacklist for different paths", () => {
			file1.settings.fileSettings.blacklist = [blacklistItem1, blacklistItem2]
			file2.settings.fileSettings.blacklist = [blacklistItem3, blacklistItem4]
			let fileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.blacklist).toMatchSnapshot()
		})

		it("should only contain unique paths+type", () => {
			file1.settings.fileSettings.blacklist = [blacklistItem1, blacklistItem2]
			file2.settings.fileSettings.blacklist = [blacklistItem1Duplicate, blacklistItem4]
			let fileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.blacklist).toMatchSnapshot()
		})
	})
})
