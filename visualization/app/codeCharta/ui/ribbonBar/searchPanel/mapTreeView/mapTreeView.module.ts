import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { IsNodeLeafPipe } from "./isNodeLeaf.pipe"
import { MapTreeViewComponent } from "./mapTreeView.component"
import { MapTreeViewItemIconComponent } from "./mapTreeViewItemIcon/mapTreeViewItemIcon.component"
import { MapTreeViewItemIconClassPipe } from "./mapTreeViewItemIcon/mapTreeViewItemIconClass.pipe"
import { MapTreeViewItemIconColorPipe } from "./mapTreeViewItemIcon/mapTreeViewItemIconColor.pipe"
import { MapTreeViewItemNameComponent } from "./mapTreeViewItemName/mapTreeViewItemName.component"
import { MapTreeViewItemOptionButtonsComponent } from "./mapTreeViewItemOptionButtons/mapTreeViewItemOptionButtons.component"
import { MapTreeViewLevelComponent } from "./mapTreeViewLevel/mapTreeViewLevel.component"
import { AreaMetricValidPipe } from "./areaMetricValidPipe.pipe"

@NgModule({
    imports: [CommonModule],
    declarations: [
        AreaMetricValidPipe,
        MapTreeViewItemIconComponent,
        MapTreeViewItemNameComponent,
        MapTreeViewItemOptionButtonsComponent,
        MapTreeViewLevelComponent,
        MapTreeViewComponent,
        IsNodeLeafPipe,
        MapTreeViewItemIconClassPipe,
        MapTreeViewItemIconColorPipe
    ],
    exports: [MapTreeViewComponent]
})
export class MapTreeViewModule {}
