import { Component } from "@angular/core"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { debounce } from "../../../util/debounce"
import { MatToolbar } from "@angular/material/toolbar"
import { UploadCustomConfigButtonComponent } from "../uploadCustomConfigButton/uploadCustomConfigButton.component"
import { DownloadCustomConfigsButtonComponent } from "../downloadCustomConfigsButton/downloadCustomConfigsButton.component"
import { AddCustomConfigButtonComponent } from "../addCustomConfigButton/addCustomConfigButton.component"
import { CdkScrollable } from "@angular/cdk/scrolling"
import { MatDialogContent } from "@angular/material/dialog"
import { MatAccordion } from "@angular/material/expansion"
import { MatFormField, MatPrefix, MatLabel } from "@angular/material/form-field"
import { MatInput } from "@angular/material/input"
import { CustomConfigItemGroupComponent } from "./customConfigItemGroup/customConfigItemGroup.component"
import { NgClass, AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-custom-config-list",
    templateUrl: "./customConfigList.component.html",
    styleUrls: ["./customConfigList.component.scss"],
    standalone: true,
    imports: [
        MatToolbar,
        UploadCustomConfigButtonComponent,
        DownloadCustomConfigsButtonComponent,
        AddCustomConfigButtonComponent,
        CdkScrollable,
        MatDialogContent,
        MatAccordion,
        MatFormField,
        MatPrefix,
        MatLabel,
        MatInput,
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
