import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { IsNodeLeafPipe } from "./isNodeLeaf.pipe"
import { MapTreeViewItemIcon } from "./mapTreeViewItemIcon/mapTreeViewItemIcon.component"
import { MapTreeViewItemIconClassPipe } from "./mapTreeViewItemIcon/mapTreeViewItemIconClass.pipe"
import { MapTreeViewItemIconColorPipe } from "./mapTreeViewItemIcon/mapTreeViewItemIconColor.pipe"
import { MapTreeViewItemName } from "./mapTreeViewItemName/mapTreeViewItemName.component"
import { MapTreeViewItemOptionButtons } from "./mapTreeViewItemOptionButtons/mapTreeViewItemOptionButtons.component"
import { MapTreeViewLevel } from "./mapTreeViewLevel/mapTreeViewLevel.component"

@NgModule({
	imports: [CommonModule],
	declarations: [
		MapTreeViewItemIcon,
		MapTreeViewItemName,
		MapTreeViewItemOptionButtons,
		MapTreeViewLevel,
		IsNodeLeafPipe,
		MapTreeViewItemIconClassPipe,
		MapTreeViewItemIconColorPipe
	],
	exports: [MapTreeViewLevel]
})
export class MapTreeViewLevelModule {}
