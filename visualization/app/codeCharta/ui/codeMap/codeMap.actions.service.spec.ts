import "./codeMap.module"
import "../../codeCharta"
import { CodeMapActionsService } from "./codeMap.actions.service"
import { SettingsService } from "../../state/settings.service"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode, Edge, BlacklistType, Settings } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import {SETTINGS, VALID_EDGE, VALID_NODE_WITH_PATH} from "../../util/dataMocks";


describe("CodeMapActionService", () => {
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService
	let threeOrbitControlsService: ThreeOrbitControlsService

	let nodeA: CodeMapNode
	let settings : Settings
	let edge : Edge

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		settingsService = getService<SettingsService>("settingsService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")

		nodeA = JSON.parse(JSON.stringify(VALID_NODE_WITH_PATH))
		settings = JSON.parse(JSON.stringify(SETTINGS))
		edge = JSON.parse(JSON.stringify(VALID_EDGE))
		settings.fileSettings.edges.push(edge)
	}

	function rebuildService() {
		codeMapActionsService = new CodeMapActionsService(
			settingsService,
			threeOrbitControlsService
		)
	}

	function withMockedSettingsService() {
		settingsService = codeMapActionsService["settingsService"] = jest.fn(() => {
			return {
				getSettings : jest.fn().mockReturnValue(settings),
				updateSettings: jest.fn(),
				fileSettings : {
					markedPackage : []
				}
			}
		})()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = codeMapActionsService["threeOrbitControlsService"] = jest.fn(() => {
			return {
				autoFitTo : jest.fn()
			}
		})()
	}

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedSettingsService()
		withMockedThreeOrbitControlsService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

    describe("toggleNodeVisibility", () => {
		beforeEach(() => {
			codeMapActionsService.showNode = jest.fn()
			codeMapActionsService.hideNode = jest.fn()
		})

    	it("should call hideNode if node is visible", () => {
			nodeA.visible = true

			codeMapActionsService.toggleNodeVisibility(nodeA)

			expect(codeMapActionsService.hideNode).toHaveBeenCalled()
		})

		it("should call showNode if node is not visible", () => {
			nodeA.visible = false

			codeMapActionsService.toggleNodeVisibility(nodeA)

			expect(codeMapActionsService.showNode).toHaveBeenCalled()
		})

		it("should call showNode if node.visible is undefined", () => {
			codeMapActionsService.toggleNodeVisibility(nodeA)

			expect(codeMapActionsService.showNode).toHaveBeenCalled()
		})
    })

	describe("markFolder", () => {
		it("should mark a folder that is not marked yet and has no marked children packages", () => {
			const expected = [{"attributes": {}, "color": "0x000000", "path": "/root"}]

			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					markedPackages: settings.fileSettings.markedPackages
				}
			})
			expect(settings.fileSettings.markedPackages.length).toBe(1)
			expect(settings.fileSettings.markedPackages).toEqual(expected)
		})

		it("should remove the children of a marked package if color is the same", () => {
			settings.fileSettings.markedPackages.push({"attributes": {}, "color": "0x000000", "path": "/root/leaf"})
			const expected = [{"attributes": {}, "color": "0x000000", "path": "/root"}]

			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					markedPackages: settings.fileSettings.markedPackages
				}
			})
			expect(settings.fileSettings.markedPackages.length).toBe(1)
			expect(settings.fileSettings.markedPackages).toEqual(expected)
		})

		it("should not remove the children of a marked package if color is different", () => {
			settings.fileSettings.markedPackages.push({"attributes": {}, "color": "0x000001", "path": "/root/leaf"})
			const expected = [ {"attributes": {}, "color": "0x000001", "path": "/root/leaf"}, {"attributes": {}, "color": "0x000000", "path": "/root"}]

			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					markedPackages: settings.fileSettings.markedPackages
				}
			})
			expect(settings.fileSettings.markedPackages.length).toBe(2)
			expect(settings.fileSettings.markedPackages).toEqual(expected)
		})

		it("should not mark with a new color if sub-nodes are already marked", () => {
			settings.fileSettings.markedPackages.push({"attributes": {}, "color": "0x000000", "path": "/root"})
			settings.fileSettings.markedPackages.push({"attributes": {}, "color": "0x000001", "path": "/root/big leaf"})
			settings.fileSettings.markedPackages.push({"attributes": {}, "color": "0x000002", "path": "/root/Parent Leaf"})
			const expected = [{"attributes": {}, "color": "0x000001", "path": "/root/big leaf"},
				{"attributes": {}, "color": "0x000002", "path": "/root/Parent Leaf"},
				{"attributes": {}, "color": "0x000003", "path": "/root"}]



			codeMapActionsService.markFolder(nodeA, "0x000003")

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					markedPackages: settings.fileSettings.markedPackages
				}
			})
			expect(settings.fileSettings.markedPackages.length).toBe(3)
			expect(settings.fileSettings.markedPackages).toEqual(expected)
		})
	})

	describe("unmarkFolder", () => {
		it("should unmark a folder that is marked and has no marked children packages", () => {
			settings.fileSettings.markedPackages.push({"attributes": {}, "color": "0x000000", "path": "/root"})

			codeMapActionsService.unmarkFolder(nodeA)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					markedPackages: settings.fileSettings.markedPackages
				}
			})
			expect(settings.fileSettings.markedPackages.length).toBe(0)
			expect(settings.fileSettings.markedPackages).toEqual([])
		})

		it("should not unmark marked children nodes", () => {
			const mp1 = {"attributes": {}, "color": "0x000000", "path": "/root/big leaf"};
			const mp2 = {"attributes": {}, "color": "0x000000", "path": "/root/Parent Leaf"};
			settings.fileSettings.markedPackages.push(mp1)
			settings.fileSettings.markedPackages.push(mp2)

			codeMapActionsService.unmarkFolder(nodeA)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					markedPackages: settings.fileSettings.markedPackages
				}
			})
			expect(settings.fileSettings.markedPackages.length).toBe(2)
			expect(settings.fileSettings.markedPackages).toEqual([mp1,mp2])
		})
	})

	describe("hideNode", () => {
		it("should call pushItemToBlacklist with built BlackListItem", () => {
			codeMapActionsService.pushItemToBlacklist = jest.fn()

			const expected = { path: nodeA.path, type: BlacklistType.hide }

			codeMapActionsService.hideNode(nodeA)

			expect(codeMapActionsService.pushItemToBlacklist).toHaveBeenCalledWith(expected)
		})
	})

	describe("showNode", () => {
		it("should call removeBlackListEntry with built BlackListItem", () => {
			codeMapActionsService.removeBlacklistEntry = jest.fn()

			const expected = { path: nodeA.path, type: BlacklistType.hide }

			codeMapActionsService.showNode(nodeA)

			expect(codeMapActionsService.removeBlacklistEntry).toHaveBeenCalledWith(expected)
		})
	})

	describe("focusNode", () => {
		it("should call removeFocusedNode if node-path equals root-path", () => {
			codeMapActionsService.removeFocusedNode = jest.fn()

			CodeChartaService.ROOT_PATH = "/root"

			codeMapActionsService.focusNode(nodeA)

			expect(codeMapActionsService.removeFocusedNode).toHaveBeenCalled()
		})

		it("should call updateSettings and autoFitTo if node-path does not equal root-path", () => {
			CodeChartaService.ROOT_PATH = "/not/root"
			const expected = { dynamicSettings: { focusedNodePath: nodeA.path } }

			codeMapActionsService.focusNode(nodeA)

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)
		})
	})

	describe("removeFocusedNode", () => {
		it("should call autoFitTo and updateSettings with focusedNodePath empty", () => {
			const expected = { dynamicSettings: { focusedNodePath: "" } }

			codeMapActionsService.removeFocusedNode()

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)
		})
	})

	describe("excludeNode", () => {
		it("should call pushItemToBlacklist with BlacklistType exclude", () => {
			codeMapActionsService.pushItemToBlacklist = jest.fn()

			const expected = { path: nodeA.path, type: BlacklistType.exclude }

			codeMapActionsService.excludeNode(nodeA)

			expect(codeMapActionsService.pushItemToBlacklist).toHaveBeenCalledWith(expected)
		})
	})

	describe("removeBlacklistEntry", () => {
		it("should call pushItemToBlacklist with BlacklistType exclude", () => {
			settings.fileSettings.blacklist.push({ path: nodeA.path + "/leaf", type: BlacklistType.exclude })
			const entry = { path: nodeA.path, type: BlacklistType.exclude }
			const expected = {"fileSettings": {"blacklist": settings.fileSettings.blacklist}}

			codeMapActionsService.removeBlacklistEntry(entry)

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)
		})
	})

	describe("pushItemToBlacklist", () => {
		it("should not update settings if item is already blacklisted", () => {
			const blacklistItem = { path: nodeA.path, type: BlacklistType.exclude }
			settings.fileSettings.blacklist.push(blacklistItem)

			codeMapActionsService.pushItemToBlacklist(blacklistItem)

			expect(settingsService.updateSettings).not.toHaveBeenCalled()
		})

		it("should update settings if item is not blacklisted", () => {
			const blacklistItem = { path: nodeA.path, type: BlacklistType.exclude }

			codeMapActionsService.pushItemToBlacklist(blacklistItem)

			expect(settingsService.updateSettings).toHaveBeenCalled()
		})
	})

	describe("showDependentEdges", () => {
		it("should change edge visibility to true on edge", () =>  {
			const expected = {...edge, visible: true}

			codeMapActionsService.showDependentEdges(nodeA.children[0])

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					edges: [expected]
				}
			})
			expect(settings.fileSettings.edges[0].visible).toBeTruthy()
		})

		it("should not add visible property to edge", () =>  {
			codeMapActionsService.showDependentEdges(nodeA)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					edges: [edge]
				}
			})
			expect(settings.fileSettings.edges[0].visible).toBeUndefined()
		})
	})

	describe("hideDependentEdges", () => {
		it("should change edge visibility to false on edge", () =>  {
			const expected = {...edge, visible: false}

			codeMapActionsService.hideDependentEdges(nodeA.children[0])

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					edges: [expected]
				}
			})
			expect(settings.fileSettings.edges[0].visible).toBeFalsy()
		})

		it("should not add visible property to edge", () =>  {
			codeMapActionsService.hideDependentEdges(nodeA)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					edges: [edge]
				}
			})
			expect(settings.fileSettings.edges[0].visible).toBeUndefined()
		})
	})

	describe("hideAllEdges", () => {
		it("should change edge visibility to false on all edges", () =>  {
			const expected = {...edge, visible: false}

			codeMapActionsService.hideAllEdges()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				fileSettings: {
					edges: [expected]
				}
			})
			expect(settings.fileSettings.edges[0].visible).toBeFalsy()
		})
	})

	describe("amountOfDependentEdges", () => {
		it("should return 0 if no edges are connected to given node", () =>  {
			const result = codeMapActionsService.amountOfDependentEdges(nodeA)

			expect(result).toBe(0)
		})

		it("should return 1 if one edges is connected to given node", () =>  {
			const result = codeMapActionsService.amountOfDependentEdges(nodeA.children[0])

			expect(result).toBe(1)
		})
	})

	describe("amountOfVisibleDependentEdges", () => {
		it("should return 0 if invisible edges are connected to given node", () =>  {
			settings.fileSettings.edges[0].visible = false
			const result = codeMapActionsService.amountOfVisibleDependentEdges(nodeA.children[0])

			expect(result).toBe(0)
		})

		it("should return 1 if one visible edges is connected to given node", () =>  {
			settings.fileSettings.edges[0].visible = true
			const result = codeMapActionsService.amountOfVisibleDependentEdges(nodeA.children[0])

			expect(result).toBe(1)
		})

		it("should return 0 if visible edges are not connected to given node", () =>  {
			settings.fileSettings.edges[0].visible = true
			const result = codeMapActionsService.amountOfVisibleDependentEdges(nodeA)

			expect(result).toBe(0)
		})
	})

	describe("isAnyEdgeVisible", () => {
		it("should return false if no edge is visible", () =>  {
			settings.fileSettings.edges[0].visible = false
			const result = codeMapActionsService.isAnyEdgeVisible()

			expect(result).toBeFalsy()
		})

		it("should return false if visible property is undefined", () =>  {
			const result = codeMapActionsService.isAnyEdgeVisible()

			expect(result).toBeFalsy()
		})

		it("should return true if one edge is visible", () =>  {
			settings.fileSettings.edges[0].visible = true
			const result = codeMapActionsService.isAnyEdgeVisible()

			expect(result).toBeTruthy()
		})
	})

	describe("getParentMP", () => {
		it("should return null if there are no marked packages", () => {
			const result = codeMapActionsService.getParentMP(nodeA.path, settings)

			expect(result).toBeNull()
		})

		it("should return null if node is a marked package", () => {
			settings.fileSettings.markedPackages.push({"attributes": {}, "color": "0x000000", "path": "/root"})

			const result = codeMapActionsService.getParentMP(nodeA.path, settings)

			expect(result).toBeNull()
		})

		it("should return marked package of root", () => {
			const expected = {"attributes": {}, "color": "0x000000", "path": "/root"}
			settings.fileSettings.markedPackages.push(expected)

			const result = codeMapActionsService.getParentMP(nodeA.children[0].path, settings)

			expect(result).toEqual(expected)
		})

		it("should return the first marked package found in sorted list", () => {
			const mp1 = {"attributes": {}, "color": "0x000000", "path": "/root"}
			const mp2 = {"attributes": {}, "color": "0x000000", "path": "/root/Parent Leaf"}
			settings.fileSettings.markedPackages.push(mp1)
			settings.fileSettings.markedPackages.push(mp2)

			const result = codeMapActionsService.getParentMP(nodeA.children[1].children[0].path, settings)

			expect(result).toEqual({"attributes": {}, "color": "0x000000", "path": "/root/Parent Leaf"})
		})
	})


})
