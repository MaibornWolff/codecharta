import { Node } from "../../../codeCharta.model"
import { CodeMapMesh } from "./codeMapMesh"
import { CodeMapBuilding } from "./codeMapBuilding"
import { StoreService } from "../../../state/store.service"
import { STATE, TEST_NODE_ROOT } from "../../../util/dataMocks"

describe("codeMapMesh", () => {
	let storeService: StoreService
	const testNodes: Node[] = [TEST_NODE_ROOT] // no need for 2 files

	beforeEach(() => {
		mockStoreService()
	})

	const mockStoreService = () => {
		storeService = jest.fn().mockReturnValue( {
			getState : jest.fn().mockReturnValue(STATE)
		})()
	}
	
	describe("setNewDeltaColor", () => {
		let codeMapBuilding : CodeMapBuilding
		const { appSettings : {mapColors} } = STATE;

		const setFlattened = (isFlat : boolean) => {
			testNodes.forEach(node => node.flat = isFlat)
		}
		
		const rebuildMesh = () => {
			const codedMapMesh = new CodeMapMesh([TEST_NODE_ROOT], storeService.getState(), true)
			codeMapBuilding = codedMapMesh.getBuildingByPath(TEST_NODE_ROOT.path)
		}

		it("should not set flat color when not flat", () => {
			setFlattened(false)
			rebuildMesh()

			expect(testNodes[0].flat).toBeFalsy()
			expect(codeMapBuilding.deltaColor).not.toEqual(mapColors.flat)
		})
		
		it("should set flat color when flat", () => {
			setFlattened(true)
			rebuildMesh()

			expect(testNodes[0].flat).toBeTruthy()
			expect(codeMapBuilding.deltaColor).toEqual(mapColors.flat)
		})
	})
})