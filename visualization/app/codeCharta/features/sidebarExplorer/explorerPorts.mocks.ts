import { Provider } from "@angular/core"
import { of } from "rxjs"
import { ExplorerRowProjection } from "../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode, NodeType, SortingOption } from "../../model/codeCharta.model"
import { UNARY_METRIC } from "../../util/metric/unaryMetric"
import { DEFAULT_EXPLORER_CAPABILITIES, EXPLORER_CAPABILITIES, ExplorerCapabilities } from "./explorerCapabilities"
import { EXPLORER_CONTEXT_MENU, ExplorerContextMenu } from "./explorerContextMenu"
import { EXPLORER_COUNTS, ExplorerCounts, ExplorerCountsSource } from "./explorerCounts.port"
import { EXPLORER_ROW, ExplorerRow } from "./explorerRow"
import { EXPLORER_RULES, ExplorerRules } from "./explorerRules.port"
import { EXPLORER_SEARCH, EXPLORER_WORD_SEARCH, ExplorerSearch, ExplorerSearchInput } from "./explorerSearch.port"
import { EXPLORER_SELECTION, ExplorerSelection } from "./explorerSelection"
import { EXPLORER_SORT, ExplorerSort } from "./explorerSort.port"
import { ExplorerStorageScope } from "./explorerStorageScope"
import { EXPLORER_TREE, ExplorerTree } from "./explorerTree.port"
import { provideViewScopedExplorerState } from "./provideViewScopedExplorerState"

const TRIVIAL_PROJECTION: ExplorerRowProjection = {
    isSelectable: true,
    isInactive: false,
    isItalic: false,
    isFlattened: false,
    isHidden: false,
    title: "",
    decoration: null,
    markingColor: null
}

export function createExplorerRowMock(project: (node: CodeMapNode) => ExplorerRowProjection = () => TRIVIAL_PROJECTION): ExplorerRow {
    return { project }
}

const TRIVIAL_ROOT_NODE: CodeMapNode = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { [UNARY_METRIC]: 0 },
    children: []
}

function createExplorerTreeMock(rootNode: CodeMapNode = TRIVIAL_ROOT_NODE): ExplorerTree {
    return { rootNodeFor: () => of(rootNode) }
}

export function createExplorerSelectionMock(overrides: Partial<ExplorerSelection> = {}): ExplorerSelection {
    return {
        isSelected: () => false,
        isHovered: () => false,
        select: jest.fn(),
        deselect: jest.fn(),
        hover: jest.fn(),
        hoverEnd: jest.fn(),
        ...overrides
    }
}

export function createExplorerContextMenuMock(overrides: Partial<ExplorerContextMenu> = {}): ExplorerContextMenu {
    return {
        isEnabledFor: () => true,
        isMarked: () => false,
        open: jest.fn(),
        close: jest.fn(),
        ...overrides
    }
}

export function createExplorerSearchMock(overrides: Partial<ExplorerSearch> = {}): ExplorerSearch {
    return {
        pattern$: of(""),
        isPatternEmpty$: of(true),
        searchedNodePaths$: of(new Set<string>()),
        setPattern: jest.fn(),
        resetPattern: jest.fn(),
        ...overrides
    }
}

export function createExplorerSearchInputMock(overrides: Partial<ExplorerSearchInput> = {}): ExplorerSearchInput {
    return {
        pattern$: of(""),
        isPatternEmpty$: of(true),
        setPattern: jest.fn(),
        resetPattern: jest.fn(),
        ...overrides
    }
}

export function createExplorerSortMock(overrides: Partial<ExplorerSort> = {}): ExplorerSort {
    return {
        option$: of(SortingOption.NAME),
        ascending$: of(true),
        setOption: jest.fn(),
        toggleAscending: jest.fn(),
        ...overrides
    }
}

const NO_COUNTS: ExplorerCounts = { shown: 0, flattened: 0, hidden: 0, noArea: 0 }

export function createExplorerCountsMock(counts: ExplorerCounts = NO_COUNTS): ExplorerCountsSource {
    return { counts$: of(counts) }
}

export function createExplorerRulesMock(overrides: Partial<ExplorerRules> = {}): ExplorerRules {
    return {
        flattenRules$: of([]),
        excludeRules$: of([]),
        isFlattenPatternDisabled$: of(true),
        isExcludePatternDisabled$: of(true),
        removeRule: jest.fn(),
        ruleFromSearchPattern: jest.fn(),
        ...overrides
    }
}

export function provideExplorerCapabilitiesMock(overrides: Partial<ExplorerCapabilities> = {}): Provider {
    return { provide: EXPLORER_CAPABILITIES, useValue: { ...DEFAULT_EXPLORER_CAPABILITIES, ...overrides } }
}

export function provideExplorerPortsMock(
    overrides: {
        row?: ExplorerRow
        selection?: ExplorerSelection
        contextMenu?: ExplorerContextMenu | null
        sort?: ExplorerSort
        search?: ExplorerSearch
        wordSearch?: ExplorerSearchInput
        tree?: ExplorerTree
        counts?: ExplorerCountsSource
        rules?: ExplorerRules
        capabilities?: Partial<ExplorerCapabilities>
        storageScope?: ExplorerStorageScope
    } = {}
): Provider[] {
    const providers: Provider[] = [
        ...provideViewScopedExplorerState(overrides.storageScope ?? "metrics"),
        { provide: EXPLORER_ROW, useValue: overrides.row ?? createExplorerRowMock() },
        { provide: EXPLORER_SELECTION, useValue: overrides.selection ?? createExplorerSelectionMock() },
        { provide: EXPLORER_SORT, useValue: overrides.sort ?? createExplorerSortMock() },
        { provide: EXPLORER_TREE, useValue: overrides.tree ?? createExplorerTreeMock() },
        { provide: EXPLORER_SEARCH, useValue: overrides.search ?? createExplorerSearchMock() },
        { provide: EXPLORER_COUNTS, useValue: overrides.counts ?? createExplorerCountsMock() },
        { provide: EXPLORER_RULES, useValue: overrides.rules ?? createExplorerRulesMock() },
        provideExplorerCapabilitiesMock(overrides.capabilities)
    ]
    if (overrides.wordSearch) {
        providers.push({ provide: EXPLORER_WORD_SEARCH, useValue: overrides.wordSearch })
    }
    if (overrides.contextMenu !== null) {
        providers.push({ provide: EXPLORER_CONTEXT_MENU, useValue: overrides.contextMenu ?? createExplorerContextMenuMock() })
    }
    return providers
}
