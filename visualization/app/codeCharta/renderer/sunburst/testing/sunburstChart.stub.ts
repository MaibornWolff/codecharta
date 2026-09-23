import { ColorMode } from "../../../model/codeCharta.model"

export { elementOfSize, resizeObserverDisconnect, stubElementSize, stubResizeObserver } from "../../../util/testUtils/domStubs"

import { defaultMapColors } from "../../../stores/mapState/mapState.read.facade"
import { SunburstColoring } from "../util/sunburstColor"
import { SunburstNode } from "../util/sunburstTree"

type ChartEventHandler = (event: unknown) => void

const chartEventHandlers = new Map<string, ChartEventHandler>()

export const stubbedChart = {
    setOption: jest.fn(),
    dispatchAction: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
    on: jest.fn((eventName: string, handler: ChartEventHandler) => chartEventHandlers.set(eventName, handler))
}

/** @public Reached from `jest.mock` factories through `jest.requireActual`, which knip cannot follow. */
export const echartsCoreStub = {
    init: jest.fn(() => stubbedChart),
    use: jest.fn()
}

export function fireChartEvent(eventName: string, event: unknown = {}): void {
    chartEventHandlers.get(eventName)(event)
}

export function resetStubbedChart(): void {
    jest.clearAllMocks()
    chartEventHandlers.clear()
}

export function lastDrawnOption() {
    return stubbedChart.setOption.mock.calls.at(-1)?.[0]
}

export function lastHighlightedPath(): string | undefined {
    return stubbedChart.dispatchAction.mock.calls.map(([action]) => action).findLast(action => action.type === "highlight")?.name
}

export const TEST_COLORING: SunburstColoring = {
    isUnaryMetric: false,
    colorRange: { from: 10, to: 20 },
    colorMode: ColorMode.absolute,
    mapColors: defaultMapColors,
    colorMetricRange: { minValue: 0, maxValue: 100 }
}

export function folderNode(path: string, children: SunburstNode[] = [], overrides: Partial<SunburstNode> = {}): SunburstNode {
    return { path, name: path.split("/").at(-1), isFile: false, area: 10, colorValue: 5, isFlat: false, children, ...overrides }
}

export function fileNode(path: string, overrides: Partial<SunburstNode> = {}): SunburstNode {
    return folderNode(path, [], { isFile: true, ...overrides })
}
