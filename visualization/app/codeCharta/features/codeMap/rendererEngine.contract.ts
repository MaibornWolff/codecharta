import { CodeMapNode } from "../../model/codeCharta.model"

/**
 * The named renderer-engine seam (Slice 14b — contract only, DoD #8).
 *
 * A page drives a renderer through this contract and never reaches into the engine's internals. The
 * frozen vocabulary is `load · highlight · settings` (inputs) + `onSelect · onHover` (outputs). Slice
 * 14b wires the one member unambiguous against today's single (codeMap) renderer — the `load` draw
 * drive, implemented by `CodeMapRenderService` and called by the render effect. The remaining
 * frozen-name members (`highlight`, `applySettings`, and the `onSelect`/`onHover` output streams) have
 * *signatures* the design deliberately defers to renderer #2's dumb-engine wrapper (highlight/settings
 * stay a store pull inside the engine; selection/hover outputs stay in the store/page layer — an engine
 * is not a store). Until the Graph renderer validates the seam, `renderer-engine-stays-dumb` /
 * `page-uses-engine-public-api` stay unstaged. See migration-2-0-plans/slice-14-renderer-page-split.md.
 */
export interface RendererEngine {
    /** Compose + lay out the render model onto the scene (the driver then requests a frame). */
    load(model: CodeMapNode): void
}
