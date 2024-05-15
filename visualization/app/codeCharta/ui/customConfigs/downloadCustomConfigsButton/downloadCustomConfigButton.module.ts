import { NgModule } from "@angular/core"

import { CustomConfigHelperService } from "../customConfigHelper.service"
import { DownloadCustomConfigsButtonComponent } from "./downloadCustomConfigsButton.component"

@NgModule({
    declarations: [DownloadCustomConfigsButtonComponent],
    exports: [DownloadCustomConfigsButtonComponent],
    providers: [CustomConfigHelperService]
})
export class DownloadCustomConfigButtonModule {}
