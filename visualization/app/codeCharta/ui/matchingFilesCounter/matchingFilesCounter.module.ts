import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { MaterialModule } from "../../../material/material.module"
import { SortingButtonComponent } from "../sortingButton/sortingButton.component"
import { SortingOptionComponent } from "../sortingOption/sortingOption.component"
import { MatchingFilesCounterComponent } from "./matchingFilesCounter.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [MatchingFilesCounterComponent, SortingButtonComponent, SortingOptionComponent],
	exports: [MatchingFilesCounterComponent]
})
export class MatchingFilesCounterModule {}
