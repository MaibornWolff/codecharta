import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import {
    DependencyDeclarations,
    dependencyDeclarationsSelector,
    edgesSelector,
    hasDependencyDataSelector,
    hasPackagesSelector
} from "../../../../lenses/dependency/dependencyLens.facade"
import { provideMockState } from "../../../../mocks/state.mocks"
import { Edge } from "../../../../model/codeCharta.model"
import { DEPENDENCY_EDGE_TYPES, DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { LeveledNode } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import {
    fireChartEvent,
    lastDrawnOption,
    resetStubbedChart,
    stubElementSize,
    stubResizeObserver
} from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultDependencyGraphSettings, dependencyGraphSettingsSelector } from "../../../../stores/preferences/preferences.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { hoveredNodePathSelector, selectedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { InspectorSectionId } from "../../inspector/inspectorModel"
import {
    dependencyLayoutIdentitySelector,
    dependencyLoadedFilesIdentitySelector,
    dependencySearchedPathsOrNullSelector,
    dependencyTreeSelector,
    isDependencyMapFocusedSelector
} from "../../selectors/dependencyMap.selectors"
import { DependencyInspectorStore } from "../../stores/dependencyInspector.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { DependencyMapComponent } from "./dependencyMap.component"

export function leveledFile(path: string, level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, kind: "file", children: [] }
}

export function leveledFolder(path: string, children: LeveledNode[], level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, kind: "folder", children }
}

const TREE = leveledFolder("/root", [
    leveledFolder("/root/ui", [leveledFile("/root/ui/view.ts")], 1),
    leveledFolder("/root/model", [leveledFile("/root/model/node.ts")])
])
const EDGES: Edge[] = [
    { fromNodeName: "/root/ui/view.ts", toNodeName: "/root/model/node.ts", attributes: { dependencies: 1 } },
    {
        fromNodeName: "/root/model/node.ts",
        toNodeName: "/root/ui/view.ts",
        attributes: { dependencies: 1 },
        isPointingUpwards: true,
        isCyclic: true
    },
    { fromNodeName: "/root/ui/view.ts", toNodeName: "/root/model/node.ts", attributes: { temporal_coupling: 0.5 } }
]

export const VIEW = "/root/ui/view.ts"
export const NODE = "/root/model/node.ts"

function leveledDeclaration(filePath: string, name: string): LeveledNode {
    return { path: `${filePath}/${name}`, name, level: 0, kind: "declaration", children: [], declarationKind: "class" }
}

export const DECLARING_TREE = leveledFolder("/root", [
    leveledFolder(
        "/root/ui",
        [{ ...leveledFile(VIEW), children: [leveledDeclaration(VIEW, "View"), leveledDeclaration(VIEW, "Menu")] }],
        1
    ),
    leveledFolder("/root/model", [{ ...leveledFile(NODE), children: [leveledDeclaration(NODE, "Node")] }])
])
export const NO_DECLARATIONS: DependencyDeclarations = { namespaces: {}, leaves: {}, leafEdges: [] }
export const DECLARATIONS: DependencyDeclarations = {
    namespaces: {},
    leaves: {
        [VIEW]: { View: { name: "View", kind: "class" }, Menu: { name: "Menu", kind: "class" } },
        [NODE]: { Node: { name: "Node", kind: "class" } }
    },
    leafEdges: [
        { fromNodeName: VIEW, fromLeaf: "View", toNodeName: NODE, toLeaf: "Node", attributes: { dependencies: 1 }, usage: ["usage"] },
        { fromNodeName: VIEW, fromLeaf: "Menu", toNodeName: VIEW, toLeaf: "View", attributes: { dependencies: 1 }, usage: ["usage"] }
    ]
}
export const CYCLIC: DependencyDeclarations = {
    ...DECLARATIONS,
    leafEdges: [
        ...DECLARATIONS.leafEdges.map(declarationEdge => ({ ...declarationEdge, isCyclic: true })),
        {
            fromNodeName: NODE,
            fromLeaf: "Node",
            toNodeName: VIEW,
            toLeaf: "View",
            attributes: { dependencies: 1 },
            usage: [],
            isCyclic: true
        }
    ]
}
export const MENU_USES_VIEW_UPWARD = {
    fromNodeName: VIEW,
    fromLeaf: "Menu",
    toNodeName: VIEW,
    toLeaf: "View",
    attributes: { dependencies: 1 },
    usage: [],
    isPointingUpwards: true
}

interface Setup {
    tree?: LeveledNode | null
    declarations?: DependencyDeclarations
    selectedPath?: string | null
    isDeltaState?: boolean
    searchedPaths?: ReadonlySet<string> | null
    hasDependencyData?: boolean
    isFocused?: boolean
    /** The graph starts with every folder closed; most tests look into them. */
    openedBoxes?: string[]
    /** The inspector starts with every section closed; most tests look into them. */
    openedSections?: InspectorSectionId[]
}

export const EVERY_FOLDER = ["/root/ui", "/root/model"]
const INSPECTOR_SECTIONS: InspectorSectionId[] = ["cycles", "uses", "usedBy", "declarations"]
const SETTINGS_SHOWING_EVERY_EDGE: DependencyGraphSettings = {
    ...defaultDependencyGraphSettings,
    shownEdgeTypes: [...DEPENDENCY_EDGE_TYPES]
}
const PROJECT_A = "project A"

export function stubTheGraphChart(): void {
    let restoreElementSize: () => void

    beforeAll(() => {
        restoreElementSize = stubElementSize(() => ({ width: 800, height: 600 }))
    })

    afterAll(() => {
        restoreElementSize()
    })

    beforeEach(() => {
        resetStubbedChart()
        stubResizeObserver()
    })
}

export async function setup({
    tree = TREE,
    declarations = NO_DECLARATIONS,
    selectedPath = null,
    isDeltaState = false,
    searchedPaths = null,
    hasDependencyData = true,
    isFocused = false,
    openedBoxes = EVERY_FOLDER,
    openedSections = INSPECTOR_SECTIONS
}: Setup = {}) {
    const rendered = await render(DependencyMapComponent, {
        providers: [
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: dependencyTreeSelector, value: tree },
                    { selector: edgesSelector, value: EDGES },
                    { selector: dependencyDeclarationsSelector, value: declarations },
                    { selector: hasPackagesSelector, value: Object.keys(declarations.namespaces).length > 0 },
                    { selector: edgeMetricSelector, value: "dependencies" },
                    { selector: hoveredNodePathSelector, value: null },
                    { selector: selectedNodePathSelector, value: selectedPath },
                    { selector: isDeltaStateSelector, value: isDeltaState },
                    { selector: dependencySearchedPathsOrNullSelector, value: searchedPaths },
                    { selector: dependencyLayoutIdentitySelector, value: PROJECT_A },
                    { selector: dependencyLoadedFilesIdentitySelector, value: PROJECT_A },
                    { selector: hasDependencyDataSelector, value: hasDependencyData },
                    { selector: isDependencyMapFocusedSelector, value: isFocused },
                    { selector: dependencyGraphSettingsSelector, value: SETTINGS_SHOWING_EVERY_EDGE }
                ]
            }),
            provideMockState(),
            { provide: FileStoreReadWindow, useValue: { isLoadingFile$: of(false) } }
        ]
    })
    for (const folder of openedBoxes) {
        TestBed.inject(DependencyMapViewStore).toggle(folder)
    }
    for (const section of openedSections) {
        TestBed.inject(DependencyInspectorStore).toggleSection(section)
    }
    rendered.fixture.detectChanges()
    const store = TestBed.inject(MockStore)
    const markReady = jest.spyOn(TestBed.inject(ViewReadinessStore), "markReady")
    jest.spyOn(store, "dispatch")
    return { ...rendered, store, markReady }
}

export async function setupSelected(selectedPath: string | null, declarations = CYCLIC) {
    return setup({ tree: DECLARING_TREE, declarations, selectedPath })
}

export function select(store: MockStore, fixture: { detectChanges: () => void }, path: string | null) {
    store.overrideSelector(selectedNodePathSelector, path)
    store.refreshState()
    fixture.detectChanges()
}

interface DrawnSeries {
    id: string
    data: { name?: string; titledBoxPath?: string; isEdge?: boolean }[]
    renderItem: (
        params: { dataIndex: number },
        api: { coord: (point: number[]) => number[] }
    ) => { children: { style: Record<string, unknown> }[] }
}

export function drawnSeries(): DrawnSeries {
    return lastDrawnOption().series[0]
}

export function drawnBoxPaths(): string[] {
    return drawnSeries()
        .data.map(item => item.name)
        .filter(name => name !== undefined)
}

export function drawnEdgeIndices(): number[] {
    return drawnSeries().data.flatMap((item, index) => (item.isEdge ? [index] : []))
}

export const boxEvent = (name: string) => ({ seriesId: "graph", name })

/** A click selects its box only once no second click has made a double click of it. */
export function clickBox(event: object): void {
    jest.useFakeTimers()
    fireChartEvent("click", event)
    jest.runAllTimers()
    jest.useRealTimers()
}

export function doubleClickBox(path: string) {
    fireChartEvent("click", boxEvent(path))
    screen.getByTestId("dependency-graph").dispatchEvent(new MouseEvent("dblclick"))
}

export function outlineWidthOf(path: string): unknown {
    const index = drawnSeries().data.findIndex(item => item.name === path)
    const outlines = drawnSeries()
        .renderItem({ dataIndex: index }, { coord: point => point })
        .children.filter(child => (child as { type?: string }).type === "rect")
    return outlines.at(-1).style.lineWidth
}

export async function changeSettings(store: MockStore, settings: Partial<DependencyGraphSettings>) {
    store.overrideSelector(dependencyGraphSettingsSelector, { ...SETTINGS_SHOWING_EVERY_EDGE, ...settings })
    store.refreshState()
    await screen.findByTestId("dependency-graph")
}

export async function loadOtherFiles(store: MockStore, tree: LeveledNode = TREE) {
    store.overrideSelector(dependencyLayoutIdentitySelector, "project B")
    store.overrideSelector(dependencyLoadedFilesIdentitySelector, "project B")
    store.overrideSelector(dependencyTreeSelector, { ...tree })
    store.refreshState()
    await screen.findByTestId("dependency-graph")
}
