import { Provider } from "@angular/core"
import { of } from "rxjs"
import { ExplorerRowProjection } from "../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode, SortingOption } from "../../model/codeCharta.model"
import { DEFAULT_EXPLORER_CAPABILITIES, EXPLORER_CAPABILITIES, ExplorerCapabilities } from "./explorerCapabilities"
import { EXPLORER_CONTEXT_MENU, ExplorerContextMenu } from "./explorerContextMenu"
import { EXPLORER_ROW, ExplorerRow } from "./explorerRow"
import { EXPLORER_SEARCH, ExplorerSearch } from "./explorerSearch.port"
import { EXPLORER_SELECTION, ExplorerSelection } from "./explorerSelection"
import { EXPLORER_SORT, ExplorerSort } from "./explorerSort.port"
import { ExplorerStorageScope } from "./explorerStorageScope"
import { provideViewScopedExplorerState } from "./provideViewScopedExplorerState"

const TRIVIAL_PROJECTION: ExplorerRowProjection = {
    isSelectable: true,
    isInactive: false,
    isItalic: false,
    isFlattened: false,
    title: "",
    decoration: null
}

export function createExplorerRowMock(project: (node: CodeMapNode) => ExplorerRowProjection = () => TRIVIAL_PROJECTION): ExplorerRow {
    return { project }
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

export function createExplorerSortMock(overrides: Partial<ExplorerSort> = {}): ExplorerSort {
    return {
        option$: of(SortingOption.NAME),
        ascending$: of(true),
        setOption: jest.fn(),
        toggleAscending: jest.fn(),
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
        capabilities?: Partial<ExplorerCapabilities>
        storageScope?: ExplorerStorageScope
    } = {}
): Provider[] {
    const providers: Provider[] = [
        ...provideViewScopedExplorerState(overrides.storageScope ?? "metrics"),
        { provide: EXPLORER_ROW, useValue: overrides.row ?? createExplorerRowMock() },
        { provide: EXPLORER_SELECTION, useValue: overrides.selection ?? createExplorerSelectionMock() },
        { provide: EXPLORER_SORT, useValue: overrides.sort ?? createExplorerSortMock() },
        { provide: EXPLORER_SEARCH, useValue: overrides.search ?? createExplorerSearchMock() },
        provideExplorerCapabilitiesMock(overrides.capabilities)
    ]
    if (overrides.contextMenu !== null) {
        providers.push({ provide: EXPLORER_CONTEXT_MENU, useValue: overrides.contextMenu ?? createExplorerContextMenuMock() })
    }
    return providers
}
