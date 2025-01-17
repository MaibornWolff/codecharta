import { map } from "rxjs"
import { Component } from "@angular/core"

import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { AttributeSideBarHeaderSectionComponent } from "./attributeSideBarHeaderSection/attributeSideBarHeaderSection.component"
import { AttributeSideBarPrimaryMetricsComponent } from "./attributeSideBarPrimaryMetrics/attributeSideBarPrimaryMetrics.component"
import { AttributeSideBarSecondaryMetricsComponent } from "./attributeSideBarSecondaryMetrics/attributeSideBarSecondaryMetrics.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-attribute-side-bar",
    templateUrl: "./attributeSideBar.component.html",
    styleUrls: ["./attributeSideBar.component.scss"],
    standalone: true,
    imports: [
        AttributeSideBarHeaderSectionComponent,
        AttributeSideBarPrimaryMetricsComponent,
        AttributeSideBarSecondaryMetricsComponent,
        AsyncPipe
    ]
})
export class AttributeSideBarComponent {
    selectedNode$ = this.store.select(selectedNodeSelector)
    fileName$ = this.store.select(accumulatedDataSelector).pipe(map(accumulatedData => accumulatedData.unifiedFileMeta?.fileName ?? ""))

    constructor(
        public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
        private readonly store: Store<CcState>
    ) {}
}
