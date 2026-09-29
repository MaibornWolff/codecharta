export { elementOfSize, reportResize, stubElementSize, stubResizeObserver } from "../../../util/testUtils/domStubs"

type ChartEventHandler = (event: unknown) => void

const chartEventHandlers = new Map<string, ChartEventHandler>()
const renderSurfaceEventHandlers = new Map<string, ChartEventHandler>()

export const stubbedChart = {
    getZr: jest.fn(() => ({
        on: (eventName: string, handler: ChartEventHandler) => renderSurfaceEventHandlers.set(eventName, handler)
    })),
    setOption: jest.fn(),
    dispatchAction: jest.fn(),
    convertFromPixel: jest.fn((_finder: unknown, [x, y]: number[]) => [x, y]),
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
