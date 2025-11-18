import { Component } from "@angular/core"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { debounce } from "../../../util/debounce"
import { UploadCustomConfigButtonComponent } from "../uploadCustomConfigButton/uploadCustomConfigButton.component"
import { DownloadCustomConfigsButtonComponent } from "../downloadCustomConfigsButton/downloadCustomConfigsButton.component"
import { AddCustomConfigButtonComponent } from "../addCustomConfigButton/addCustomConfigButton.component"
import { CustomConfigItemGroupComponent } from "./customConfigItemGroup/customConfigItemGroup.component"
import { NgClass, AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-custom-config-list",
    templateUrl: "./customConfigList.component.html",
    styleUrls: ["./customConfigList.component.scss"],
    imports: [
        UploadCustomConfigButtonComponent,
        DownloadCustomConfigsButtonComponent,
        AddCustomConfigButtonComponent,
        CustomConfigItemGroupComponent,
        NgClass,
        AsyncPipe
    ]
})
export class CustomConfigListComponent {
    searchTerm = ""
    isNonApplicableListCollapsed = true
    searchPlaceholder = "Search by name, mode and metrics..."
    setSearchTermDebounced = debounce((event: Event) => (this.searchTerm = event.target["value"]), 400)

    constructor(public customConfigService: CustomConfigHelperService) {}

    toggleNonApplicableCustomConfigsList() {
        this.isNonApplicableListCollapsed = !this.isNonApplicableListCollapsed
    }
}
