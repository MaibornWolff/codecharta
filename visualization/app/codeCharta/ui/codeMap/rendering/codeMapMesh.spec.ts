import { STATE, TEST_NODE_ROOT } from "../../../util/dataMocks"
import { CodeMapMesh } from "./codeMapMesh"
import { StoreService } from "../../../state/store.service"
import { CodeMapBuilding } from "./codeMapBuilding"

describe("codeMapMesh", () => {
	let storeService: StoreService

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
			[TEST_NODE_ROOT].map(item => item.flat = isFlat)
		}

		const rebuildMesh = () => {
			const codedMapMesh = new CodeMapMesh([TEST_NODE_ROOT], storeService.getState(), true)
			codeMapBuilding = codedMapMesh.getBuildingByPath(TEST_NODE_ROOT.path)
		}

		it("should not set flat color when not flat", () => {
			setFlattened(false)
			rebuildMesh()

			expect(TEST_NODE_ROOT.flat).toBeFalsy()
			expect(codeMapBuilding.deltaColor).not.toEqual(mapColors.flat)
		})
		
		it("should set flat color when flat", () => {
			setFlattened(true)
			rebuildMesh()

			expect(TEST_NODE_ROOT.flat).toBeTruthy()
			expect(codeMapBuilding.deltaColor).toEqual(mapColors.flat)
		})
	})
})