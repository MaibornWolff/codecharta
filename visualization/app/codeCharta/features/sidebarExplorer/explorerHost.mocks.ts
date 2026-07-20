import { Provider } from "@angular/core"
import { EXPLORER_HOST, ExplorerHost } from "./explorerHost"

/**
 * A neutral ExplorerHost for specs that render explorer components: everything selectable, nothing
 * dimmed, no decorations, no context menu. Override individual members per test.
 */
export function createExplorerHostMock(overrides: Partial<ExplorerHost> = {}): ExplorerHost {
    return {
        capabilities: { showRules: true, showSearch: true, showCounts: true },
        isSelectable: () => true,
        rowState: () => ({ isDimmed: false, isItalic: false, title: "" }),
        rowDecoration: () => null,
        hasContextMenu: () => true,
        onHover: jest.fn(),
        onHoverEnd: jest.fn(),
        onSelect: jest.fn(),
        onDeselect: jest.fn(),
        ...overrides
    }
}

export function provideExplorerHostMock(overrides: Partial<ExplorerHost> = {}): Provider {
    return { provide: EXPLORER_HOST, useValue: createExplorerHostMock(overrides) }
}
