import { Provider } from "@angular/core"
import { of } from "rxjs"
import { ExplorerRowProjection } from "../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode, SortingOption } from "../../model/codeCharta.model"
import { EXPLORER_CAPABILITIES, ExplorerCapabilities } from "./explorerCapabilities"
import { EXPLORER_CONTEXT_MENU, ExplorerContextMenu } from "./explorerContextMenu"
import { EXPLORER_ROW, ExplorerRow } from "./explorerRow"
import { EXPLORER_SELECTION, ExplorerSelection } from "./explorerSelection"
import { EXPLORER_SORT, ExplorerSort } from "./explorerSort.port"

const TRIVIAL_PROJECTION: ExplorerRowProjection = {
    isSelectable: true,
    isDimmed: false,
    isItalic: false,
    title: "",
    decoration: null
}

/** A neutral row projection for specs: everything selectable, nothing dimmed, no decoration. */
export function createExplorerRowMock(project: (node: CodeMapNode) => ExplorerRowProjection = () => TRIVIAL_PROJECTION): ExplorerRow {
    return { project }
}

/** A neutral selection port for specs: nothing selected or hovered; the writes are jest spies. */
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

/** A neutral context menu for specs: enabled for every node, nothing marked; the writes are jest spies. */
export function createExplorerContextMenuMock(overrides: Partial<ExplorerContextMenu> = {}): ExplorerContextMenu {
    return {
        isEnabledFor: () => true,
        isMarked: () => false,
        open: jest.fn(),
        close: jest.fn(),
        ...overrides
    }
}

/** A neutral sort port for specs: sorts by Name ascending; the writes are jest spies. */
export function createExplorerSortMock(overrides: Partial<ExplorerSort> = {}): ExplorerSort {
    return {
        option$: of(SortingOption.NAME),
        ascending$: of(true),
        setOption: jest.fn(),
        toggleAscending: jest.fn(),
        ...overrides
    }
}

const DEFAULT_CAPABILITIES: ExplorerCapabilities = {
    showRules: true,
    showSearch: true,
    showCounts: true,
    sortOptions: Object.values(SortingOption)
}

export function provideExplorerCapabilitiesMock(overrides: Partial<ExplorerCapabilities> = {}): Provider {
    return { provide: EXPLORER_CAPABILITIES, useValue: { ...DEFAULT_CAPABILITIES, ...overrides } }
}

/**
 * Provides all explorer ports for specs that render explorer components. Individual ports can be overridden
 * — pass the instance a spec wants to assert against (e.g. `{ selection: createExplorerSelectionMock(...) }`).
 * Context menu can be dropped with `{ contextMenu: null }` to exercise the no-menu path.
 */
export function provideExplorerPortsMock(
    overrides: {
        row?: ExplorerRow
        selection?: ExplorerSelection
        contextMenu?: ExplorerContextMenu | null
        sort?: ExplorerSort
        capabilities?: Partial<ExplorerCapabilities>
    } = {}
): Provider[] {
    const providers: Provider[] = [
        { provide: EXPLORER_ROW, useValue: overrides.row ?? createExplorerRowMock() },
        { provide: EXPLORER_SELECTION, useValue: overrides.selection ?? createExplorerSelectionMock() },
        { provide: EXPLORER_SORT, useValue: overrides.sort ?? createExplorerSortMock() },
        provideExplorerCapabilitiesMock(overrides.capabilities)
    ]
    if (overrides.contextMenu !== null) {
        providers.push({ provide: EXPLORER_CONTEXT_MENU, useValue: overrides.contextMenu ?? createExplorerContextMenuMock() })
    }
    return providers
}
