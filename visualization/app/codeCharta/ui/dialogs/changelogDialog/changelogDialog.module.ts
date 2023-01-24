import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ChangelogDialogComponent } from "./changelogDialog.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [ChangelogDialogComponent]
})
export class ChangelogDialogModule {}
