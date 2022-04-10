import { NgModule } from "@angular/core"

import { CustomConfigHelperService } from "../customConfigHelper.service"
import { DownloadCustomConfigsButtonComponent } from "./downloadCustomConfigsButton.component"

@NgModule({
	declarations: [DownloadCustomConfigsButtonComponent],
	exports: [DownloadCustomConfigsButtonComponent],
	providers: [CustomConfigHelperService],
	entryComponents: [DownloadCustomConfigsButtonComponent]
})
export class DownloadCustomConfigButtonModule {}
