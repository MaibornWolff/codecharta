import { NgModule } from "@angular/core"

import { CustomConfigHelperService } from "../customConfigHelper.service"
import { DownloadCustomConfigsButtonComponent } from "./downloadCustomConfigsButton.component"

@NgModule({
    imports: [DownloadCustomConfigsButtonComponent],
    exports: [DownloadCustomConfigsButtonComponent],
    providers: [CustomConfigHelperService]
})
export class DownloadCustomConfigButtonModule {}
