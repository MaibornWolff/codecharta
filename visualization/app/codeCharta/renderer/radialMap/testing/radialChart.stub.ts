import { ColorMode, RadialFolderStyle, RadialFolderValue } from "../../../model/codeCharta.model"

export { elementOfSize, resizeObserverDisconnect, stubElementSize, stubResizeObserver } from "../../../util/testUtils/domStubs"

import { defaultMapColors } from "../../../stores/mapState/mapState.read.facade"
import { RadialColoring } from "../util/radialColor"
import { RadialNode } from "../util/radialTree"

type ChartEventHandler = (event: unknown) => void

const chartEventHandlers = new Map<string, ChartEventHandler>()
const renderSurfaceEventHandlers = new Map<string, ChartEventHandler>()

export const stubbedChart = {
    getZr: jest.fn(() => ({ on: (eventName: string, handler: ChartEventHandler) => renderSurfaceEventHandlers.set(eventName, handler) })),
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

export function fireRenderSurfaceEvent(eventName: string, event: unknown = {}): void {
    renderSurfaceEventHandlers.get(eventName)(event)
}

export function resetStubbedChart(): void {
    jest.clearAllMocks()
    chartEventHandlers.clear()
    renderSurfaceEventHandlers.clear()
}

export function lastDrawnOption() {
    return stubbedChart.setOption.mock.calls.at(-1)?.[0]
}

export function lastHighlightedPath(): string | undefined {
    return stubbedChart.dispatchAction.mock.calls.map(([action]) => action).findLast(action => action.type === "highlight")?.name
}

export const TEST_COLORING: RadialColoring = {
    isUnaryMetric: false,
    colorRange: { from: 10, to: 20 },
    colorMode: ColorMode.absolute,
    mapColors: defaultMapColors,
    colorMetricRange: { minValue: 0, maxValue: 100 },
    folders: { values: new Map(), value: RadialFolderValue.Max, style: RadialFolderStyle.Tinted, tint: 0.5 },
    highlight: { selectedPath: null }
}

export function folderNode(path: string, children: RadialNode[] = [], overrides: Partial<RadialNode> = {}): RadialNode {
    return { path, name: path.split("/").at(-1), isFile: false, area: 10, colorValue: 5, isFlat: false, children, ...overrides }
}

export function fileNode(path: string, overrides: Partial<RadialNode> = {}): RadialNode {
    return folderNode(path, [], { isFile: true, ...overrides })
}
