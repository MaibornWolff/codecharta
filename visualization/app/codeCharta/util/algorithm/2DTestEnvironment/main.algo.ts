import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { AlgoUiModule } from "./algo-ui.module"

platformBrowserDynamic()
    .bootstrapModule(AlgoUiModule)
    .catch(err => console.error(err))
