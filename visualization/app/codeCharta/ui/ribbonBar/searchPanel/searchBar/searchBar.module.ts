import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../material/material.module"
import { SearchBarComponent } from "./searchBar.component"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [SearchBarComponent],
    exports: [SearchBarComponent]
})
export class SearchBarModule {}
