import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { Settings, Node, MetricData, CodeMapNode, FileMeta } from "../../codeCharta.model"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { METRIC_DATA, SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"
import { RenderData } from "./codeMap.preRender.service"
import _ from "lodash"
import { NodeDecorator } from "../../util/nodeDecorator"

describe("codeMapRenderService", () => {
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService

	let settings: Settings
	let map: CodeMapNode
	let metricData: MetricData[]
	let fileMeta: FileMeta

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")

		fileMeta = _.cloneDeep(TEST_FILE_WITH_PATHS.fileMeta)
		settings = _.cloneDeep(SETTINGS)
		metricData = _.cloneDeep(METRIC_DATA)
		map = NodeDecorator.decorateMap(_.cloneDeep(TEST_FILE_WITH_PATHS.map), fileMeta, [], metricData)
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService(threeSceneService, codeMapLabelService, codeMapArrowService)
	}

	describe("getSortedNodes", () => {
		it("should get sorted Nodes as array", () => {
			const renderData: RenderData = {
				map: map,
				settings: settings,
				metricData: metricData,
				fileStates: null,
				fileMeta: null
			}
			const sortedNodes: Node[] = codeMapRenderService["getSortedNodes"](renderData)
			expect(sortedNodes).toMatchSnapshot()
		})
	})
})
