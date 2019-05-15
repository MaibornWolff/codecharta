import { AttributeType, BlacklistItem, BlacklistType, CCFile, Edge, FileSettings, Settings } from "../codeCharta.model"
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
				attributeTypes: {}
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
				attributeTypes: {}
			}
		}
	}

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
		const attributes1 = {
			nodes: {
				["attribute1"]: AttributeType.absolute
			},
			edges: {
				["attribute2"]: AttributeType.relative
			}
		}

		const attributes2 = {
			nodes: {
				["attribute3"]: AttributeType.absolute
			},
			edges: {
				["attribute4"]: AttributeType.relative
			}
		}

		const attributes3 = {
			nodes: {
				["attribute1"]: AttributeType.relative
			},
			edges: {}
		}

		it("should merge different attributeTypes", () => {
			file1.settings.fileSettings.attributeTypes = attributes1
			file2.settings.fileSettings.attributeTypes = attributes2
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.attributeTypes).toMatchSnapshot()
		})

		it("should merge attributeTypes if one file does not contain attributeTypes", () => {
			file1.settings.fileSettings.attributeTypes = attributes1
			file2.settings.fileSettings.attributeTypes = {}
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.attributeTypes).toMatchSnapshot()
		})

		it("should overwrite attributeType if the same exists", () => {
			file1.settings.fileSettings.attributeTypes = attributes1
			file2.settings.fileSettings.attributeTypes = attributes3
			let fileSettings: FileSettings = SettingsMerger.getMergedFileSettings([file1, file2])
			expect(fileSettings.attributeTypes).toMatchSnapshot()
		})
	})

	describe("Blacklist merge", () => {
		const blacklistItem1: BlacklistItem = { path: "/root/nodeA", type: BlacklistType.exclude }
		const blacklistItem2: BlacklistItem = { path: "/another/nodeB", type: BlacklistType.hide }
		const blacklistItem3: BlacklistItem = { path: "/another/nodeC", type: BlacklistType.exclude }
		const blacklistItem4: BlacklistItem = { path: "*prefix/nodeD", type: BlacklistType.hide }
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
