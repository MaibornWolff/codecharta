import { NgModule } from "@angular/core"

import { DownloadCustomConfigService } from "./downloadCustomConfig.service"
import { DownloadCustomConfigsButtonComponent } from "./downloadCustomConfigsButton.component"

@NgModule({
	declarations: [DownloadCustomConfigsButtonComponent],
	exports: [DownloadCustomConfigsButtonComponent],
	providers: [DownloadCustomConfigService],
	entryComponents: [DownloadCustomConfigsButtonComponent]
})
export class DownloadCustomConfigButtonModule {}
