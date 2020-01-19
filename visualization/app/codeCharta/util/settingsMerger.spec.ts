import { CCFile, FileSettings, MarkedPackage } from "../codeCharta.model"
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
})
