import "../../../state/state.module"
import { Node } from "../../../codeCharta.model"
import { STATE, TEST_NODES } from "../../../util/dataMocks"
import { StoreService } from "../../../state/store.service"
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
		STATE.dynamicSettings.heightMetric = "a" // set to a, since it is the delta defined in TEST_NODES

		storeService = jest.fn().mockReturnValue( {
			getState : jest.fn().mockReturnValue(STATE)
		})()
	}

	const setTestNodes = () => {
		let updatedNode = {height: 50, z0 :0, heightDelta : -50} // just simple values
		return TEST_NODES.map(node => { return {...node,...updatedNode} })
	} 

	const initData = () => {
		geomGen = new GeometryGenerator()
		testNodes = setTestNodes()
	}

	describe("addBuilding", () => {
		let buildResult : BuildResult
		const any = expect.anything()
		const setFlattened = (isFlat : boolean) => {
			testNodes.map(item => item.flat = isFlat)
		}

		it("should add delta to height when not falttened", () => {
			setFlattened(false)
			const addBuildingFn = spyOn<any>(geomGen,'addBuilding').and.callThrough()
			buildResult = geomGen.build(testNodes, null, storeService.getState(), true)
			
			expect(testNodes[0].flat).toBeFalsy()
			expect(addBuildingFn).toHaveBeenCalledWith(any,any,any,any,any,true) // make sure deltaState is active
			expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(100)
		})

		it("should not add delta to height when falttened", () => {
			setFlattened(true)
			const addBuildingFn = spyOn<any>(geomGen,'addBuilding').and.callThrough()
			buildResult = geomGen.build(testNodes, null, storeService.getState(), true)
			
			expect(testNodes[0].flat).toBeTruthy()
			expect(addBuildingFn).toHaveBeenCalledWith(any,any,any,any,any,true) // make sure deltaState is active
			expect(buildResult.desc.buildings[0].boundingBox.max.y).toBe(50)
		})
	})
})