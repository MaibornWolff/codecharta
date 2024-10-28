import { CustomConfigsComponent } from "./customConfigs.component"
import { NgModule } from "@angular/core"

import { CommonModule } from "@angular/common"

import { DownloadCustomConfigButtonModule } from "./downloadCustomConfigsButton/downloadCustomConfigButton.module"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { CustomConfigItemGroupComponent } from "./customConfigList/customConfigItemGroup/customConfigItemGroup.component"
import { CustomConfig2ApplicableMessage } from "./customConfigList/customConfigItemGroup/customConfig2ApplicableMessage.pipe"
import { CustomConfig2ApplicableColor } from "./customConfigList/customConfigItemGroup/customConfig2ApplicableColor.pipe"
import { ApplyCustomConfigButtonComponent } from "./customConfigList/customConfigItemGroup/customConfigDescription/applyCustomConfigButton.component"
import { CustomConfigColorSchemaBySelectionMode } from "./customConfigList/customConfigItemGroup/customConfigDescription/customConfigColorSchemaBySelectionMode.pipe"
import { FormsModule } from "@angular/forms"

import { FilterCustomConfigDataBySearchTermPipe } from "./customConfigList/customConfigItemGroup/customConfigDescription/filterCustomConfigDataBySearchTerm.pipe"

@NgModule({
    imports: [
        CommonModule,
        DownloadCustomConfigButtonModule,
        FormsModule,
        CustomConfigsComponent,
        CustomConfigListComponent,
        CustomConfigItemGroupComponent,
        ApplyCustomConfigButtonComponent,
        CustomConfig2ApplicableMessage,
        CustomConfig2ApplicableColor,
        FilterCustomConfigDataBySearchTermPipe,
        CustomConfigColorSchemaBySelectionMode
    ],
    exports: [CustomConfigsComponent]
})
export class CustomConfigsModule {}
