import { SearchPanelComponent } from "./searchPanel.component"
import { SearchPanelModeSelectorComponent } from "./searchPanelModeSelector/searchPanelModeSelector.component"
import { BlacklistPanelComponent } from "./blacklistPanel/blacklistPanel.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../material/material.module"
import { SearchBarModule } from "./searchBar/searchBar.module"
import { MatchingFilesCounterModule } from "./matchingFilesCounter/matchingFilesCounter.module"
import { MapTreeViewModule } from "./mapTreeView/mapTreeView.module"

@NgModule({
    imports: [CommonModule, MaterialModule, SearchBarModule, MatchingFilesCounterModule, MapTreeViewModule],
    declarations: [SearchPanelComponent, SearchPanelModeSelectorComponent, BlacklistPanelComponent],
    exports: [SearchPanelComponent]
})
export class SearchPanelModule {}
