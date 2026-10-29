export { elementOfSize, reportResize, stubElementSize, stubResizeObserver } from "../../../util/testUtils/domStubs"

type ChartEventHandler = (event: unknown) => void

const chartEventHandlers = new Map<string, ChartEventHandler>()
const renderSurfaceEventHandlers = new Map<string, ChartEventHandler>()

const pixelsAsLayoutUnits = (_finder: unknown, [x, y]: number[]) => [x, y]

const STUBBED_AXIS_REACH = { min: -1000, max: 2000 }

export const stubbedChart = {
    getZr: jest.fn(() => ({
        on: (eventName: string, handler: ChartEventHandler) => renderSurfaceEventHandlers.set(eventName, handler)
    })),
    setOption: jest.fn(),
    dispatchAction: jest.fn(),
    getOption: jest.fn(() => ({ xAxis: [STUBBED_AXIS_REACH], yAxis: [STUBBED_AXIS_REACH] })),
    convertFromPixel: jest.fn(pixelsAsLayoutUnits),
    convertToPixel: jest.fn(pixelsAsLayoutUnits),
    resize: jest.fn(),
    getRenderedCanvas: jest.fn(() => document.createElement("canvas")),
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
    stubbedChart.convertFromPixel.mockImplementation(pixelsAsLayoutUnits)
    stubbedChart.convertToPixel.mockImplementation(pixelsAsLayoutUnits)
    chartEventHandlers.clear()
    renderSurfaceEventHandlers.clear()
}

export function lastDrawnOption() {
    return stubbedChart.setOption.mock.calls.at(-1)?.[0]
}
