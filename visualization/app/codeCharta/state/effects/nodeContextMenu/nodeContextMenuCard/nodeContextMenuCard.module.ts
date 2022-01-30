import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../material/material.module"
import { ExcludeButtonComponent } from "../excludeButton/excludeButton.component"
import { FlattenButtonsModule } from "../flattenButtons/flattenButtons.module"
import { FocusButtonsModule } from "../focusButtons/focusButtons.module"
import { HighlightButtonsModule } from "../highlightButtons/highlightButtons.module"
import { MarkFolderRowModule } from "../markFolderRow/markFolderRow.module"
import { LastPartOfNodePathPipe } from "./lastPartOfNodePath.pipe"
import { NodeContextMenuCardComponent } from "./nodeContextMenuCard.component"

@NgModule({
	imports: [CommonModule, MaterialModule, FlattenButtonsModule, FocusButtonsModule, HighlightButtonsModule, MarkFolderRowModule],
	declarations: [NodeContextMenuCardComponent, LastPartOfNodePathPipe, ExcludeButtonComponent],
	exports: [NodeContextMenuCardComponent]
})
export class NodeContextMenuCardModule {}
