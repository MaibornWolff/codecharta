import { Node } from "../../../codeCharta.model"
import { StoreService } from "../../../state/store.service"
import { STATE, TEST_NODE_ROOT } from "../../../util/dataMocks"
import { BuildResult, GeometryGenerator } from "./geometryGenerator"

describe("geometryGenerator", () => {
	let geomGen : GeometryGenerator
	let storeService: StoreService
	let testNodes: Node[]

	beforeEach(() => {
		mockStoreService()
		initData()
	})

	const mockStoreService = () => {
		STATE.dynamicSettings.heightMetric = "a" // set to a, since it is the delta defined in TEST_NODE_ROOT

		storeService = jest.fn().mockReturnValue( {
			getState : jest.fn().mockReturnValue(STATE)
		})()
	}

	const setTestNodes = () => {
		const updatedNode = {heightDelta : -50} // delta has to be negative why is that ?
		return [TEST_NODE_ROOT].map(node => { return {...node,...updatedNode} })
	} 

	const initData = () => {
		geomGen = new GeometryGenerator()
		testNodes = setTestNodes()
	}

	describe("addBuilding", () => {
		let buildResult : BuildResult
		const setFlattened = (isFlat : boolean) => {
			testNodes.forEach(element => {
				element.flat = isFlat
			});
		}

		it("should add delta to height when not flattened", () => {
			setFlattened(false)
			buildResult = geomGen.build(testNodes, null, storeService.getState(), true)
			
			expect(testNodes[0].flat).toBeFalsy()
			expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(58)
		})

		it("should not add delta to height when flattened", () => {
			setFlattened(true)
			buildResult = geomGen.build(testNodes, null, storeService.getState(), true)
			
			expect(testNodes[0].flat).toBeTruthy()
			expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(8)
		})
	})
})