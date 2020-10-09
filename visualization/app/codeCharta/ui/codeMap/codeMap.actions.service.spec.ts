import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapActionsService } from "./codeMap.actions.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode } from "../../codeCharta.model"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { clone } from "../../util/clone"

describe("CodeMapActionService", () => {
	let codeMapActionsService: CodeMapActionsService
	let edgeMetricDataService: EdgeMetricDataService
	let storeService: StoreService

	let nodeA: CodeMapNode

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
		storeService = getService<StoreService>("storeService")

		nodeA = clone(VALID_NODE_WITH_PATH)
		storeService.dispatch(setMarkedPackages())
	}

	function rebuildService() {
		codeMapActionsService = new CodeMapActionsService(edgeMetricDataService, storeService)
	}

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	describe("markFolder", () => {
		it("should mark a folder that is not marked yet and has no marked children packages", () => {
			const expected = [{ color: "0x000000", path: "/root" }]

			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(1)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should remove the children of a marked package if color is the same", () => {
			const expected = [{ color: "0x000000", path: "/root" }]

			codeMapActionsService.markFolder(nodeA.children[0], "0x000000")
			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(1)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should not remove the children of a marked package if color is different", () => {
			const expected = [
				{ color: "0x000000", path: "/root" },
				{ color: "0x000001", path: "/root/big leaf" }
			]

			codeMapActionsService.markFolder(nodeA, "0x000000")
			codeMapActionsService.markFolder(nodeA.children[0], "0x000001")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(2)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should not mark with a new color if sub-nodes are already marked", () => {
			const expected = [
				{ color: "0x000003", path: "/root" },
				{ color: "0x000001", path: "/root/big leaf" },
				{ color: "0x000002", path: "/root/Parent Leaf" }
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
				{ color: "0x000000", path: "/root/big leaf" },
				{ color: "0x000000", path: "/root/Parent Leaf" }
			]

			codeMapActionsService.markFolder(nodeA.children[0], "0x000000")
			codeMapActionsService.markFolder(nodeA.children[1], "0x000000")

			codeMapActionsService.unmarkFolder(nodeA)

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(2)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})
	})

	describe("getParentMarkedPackageIndex", () => {
		it("should return null if there are no marked packages", () => {
			const result = codeMapActionsService.getParentMarkedPackageIndex(nodeA.path)

			expect(result).toEqual(-1)
		})

		it("should return null if node is a marked package", () => {
			codeMapActionsService.markFolder(nodeA, "0x000000")

			const result = codeMapActionsService.getParentMarkedPackageIndex(nodeA.path)

			expect(result).toEqual(-1)
		})

		it("should return marked package of root", () => {
			codeMapActionsService.markFolder(nodeA, "0x000000")

			const result = codeMapActionsService.getParentMarkedPackageIndex(nodeA.children[0].path)

			expect(result).toEqual(0)
		})

		it("should return the correct parent marked package", () => {
			codeMapActionsService.markFolder(nodeA, "0x000000")
			codeMapActionsService.markFolder(nodeA.children[1], "0x000001")

			const result = codeMapActionsService.getParentMarkedPackageIndex(nodeA.children[1].children[0].path)

			expect(result).toEqual(1)
		})
	})
})
