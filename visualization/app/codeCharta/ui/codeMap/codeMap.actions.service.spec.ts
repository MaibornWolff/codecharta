import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapActionsService } from "./codeMap.actions.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode } from "../../model/codeCharta.model"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { StoreService } from "../../state/store.service"
import _ from "lodash"
import { markPackage, setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"

describe("CodeMapActionService", () => {
	let codeMapActionsService: CodeMapActionsService
	let edgeMetricDataService: EdgeMetricDataService
	let storeService: StoreService

	let nodeA: CodeMapNode

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
		storeService = getService<StoreService>("storeService")

		nodeA = _.cloneDeep(VALID_NODE_WITH_PATH)
		storeService.dispatch(setMarkedPackages())
	}

	function rebuildService() {
		codeMapActionsService = new CodeMapActionsService(edgeMetricDataService, storeService)
	}

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("markFolder", () => {
		it("should mark a folder that is not marked yet and has no marked children packages", () => {
			const expected = [{ attributes: {}, color: "0x000000", path: "/root" }]

			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(1)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should remove the children of a marked package if color is the same", () => {
			const expected = [{ attributes: {}, color: "0x000000", path: "/root" }]

			codeMapActionsService.markFolder(nodeA.children[0], "0x000000")
			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(1)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should not remove the children of a marked package if color is different", () => {
			const expected = [
				{ attributes: {}, color: "0x000000", path: "/root" },
				{ attributes: {}, color: "0x000001", path: "/root/big leaf" }
			]

			codeMapActionsService.markFolder(nodeA, "0x000000")
			codeMapActionsService.markFolder(nodeA.children[0], "0x000001")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(2)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should not mark with a new color if sub-nodes are already marked", () => {
			const expected = [
				{ attributes: {}, color: "0x000001", path: "/root/big leaf" },
				{ attributes: {}, color: "0x000002", path: "/root/Parent Leaf" },
				{ attributes: {}, color: "0x000003", path: "/root" }
			]

			codeMapActionsService.markFolder(nodeA, "0x000000")
			codeMapActionsService.markFolder(nodeA.children[0], "0x000001")
			codeMapActionsService.markFolder(nodeA.children[1], "0x000002")

			codeMapActionsService.markFolder(nodeA, "0x000003")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(3)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})
	})

	describe("unmarkFolder", () => {
		it("should unmark a folder that is marked and has no marked children packages", () => {
			codeMapActionsService.markFolder(nodeA, "0x000000")

			codeMapActionsService.unmarkFolder(nodeA)

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(0)
			expect(storeService.getState().fileSettings.markedPackages).toEqual([])
		})

		it("should not unmark marked children nodes", () => {
			const expected = [
				{ attributes: {}, color: "0x000000", path: "/root/big leaf" },
				{ attributes: {}, color: "0x000000", path: "/root/Parent Leaf" }
			]

			codeMapActionsService.markFolder(nodeA.children[0], "0x000000")
			codeMapActionsService.markFolder(nodeA.children[1], "0x000000")

			codeMapActionsService.unmarkFolder(nodeA)

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(2)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})
	})

	describe("getParentMP", () => {
		it("should return null if there are no marked packages", () => {
			const result = codeMapActionsService.getParentMP(nodeA.path)

			expect(result).toBeNull()
		})

		it("should return null if node is a marked package", () => {
			storeService.dispatch(markPackage({ attributes: {}, color: "0x000000", path: "/root" }))

			const result = codeMapActionsService.getParentMP(nodeA.path)

			expect(result).toBeNull()
		})

		it("should return marked package of root", () => {
			const expected = { attributes: {}, color: "0x000000", path: "/root" }
			storeService.dispatch(markPackage(expected))

			const result = codeMapActionsService.getParentMP(nodeA.children[0].path)

			expect(result).toEqual(expected)
		})

		it("should return the first marked package found in sorted list", () => {
			const mp1 = { attributes: {}, color: "0x000000", path: "/root" }
			const mp2 = { attributes: {}, color: "0x000000", path: "/root/Parent Leaf" }
			storeService.dispatch(markPackage(mp1))
			storeService.dispatch(markPackage(mp2))

			const result = codeMapActionsService.getParentMP(nodeA.children[1].children[0].path)

			expect(result).toEqual({ attributes: {}, color: "0x000000", path: "/root/Parent Leaf" })
		})
	})
})
