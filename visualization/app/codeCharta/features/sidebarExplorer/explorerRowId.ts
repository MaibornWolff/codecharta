import { ExplorerStorageScope } from "./explorerStorageScope"

// Two explorers can render the same node path, so their row elements are told apart by the view they belong to.
export const explorerRowId = (scope: ExplorerStorageScope, path: string) => `${scope}:${path}`
