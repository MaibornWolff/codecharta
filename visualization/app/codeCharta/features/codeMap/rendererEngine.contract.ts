import { CodeMapNode } from "../../model/codeCharta.model"

export interface RendererEngine {
    load(model: CodeMapNode): void
}
