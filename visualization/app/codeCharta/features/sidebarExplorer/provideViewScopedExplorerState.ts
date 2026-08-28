import { Provider } from "@angular/core"
import { EXPLORER_STORAGE_SCOPE, ExplorerStorageScope } from "./explorerStorageScope"
import { ExplorerCollapseRepo } from "./repos/explorerCollapse.repo"
import { ExplorerWidthRepo } from "./repos/explorerWidth.repo"
import { ExplorerCollapseService } from "./services/explorerCollapse.service"
import { ExplorerRevealService } from "./services/explorerReveal.service"
import { ExplorerScrollHostService } from "./services/explorerScrollHost.service"
import { ExplorerWidthService } from "./services/explorerWidth.service"

export const provideViewScopedExplorerState = (scope: ExplorerStorageScope): Provider[] => [
    { provide: EXPLORER_STORAGE_SCOPE, useValue: scope },
    ExplorerCollapseRepo,
    ExplorerCollapseService,
    ExplorerWidthRepo,
    ExplorerWidthService,
    ExplorerRevealService,
    ExplorerScrollHostService
]
