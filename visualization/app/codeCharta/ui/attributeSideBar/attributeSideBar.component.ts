import { map } from "rxjs"
import { Component } from "@angular/core"

import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"

@Component({
    selector: "cc-attribute-side-bar",
    templateUrl: "./attributeSideBar.component.html",
    styleUrls: ["./attributeSideBar.component.scss"]
})
export class AttributeSideBarComponent {
    selectedNode$ = this.store.select(selectedNodeSelector)
    fileName$ = this.store.select(accumulatedDataSelector).pipe(map(accumulatedData => accumulatedData.unifiedFileMeta?.fileName ?? ""))

    constructor(
        public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
        private store: Store<CcState>
    ) {}
}
