import "./customViews.component.scss"
import {DialogService} from "../dialog/dialog.service";
import {CustomViewHelper} from "../../util/customViewHelper";
import {StoreService} from "../../state/store.service";
import {setState} from "../../state/store/state.actions";
import {setColorRange} from "../../state/store/dynamicSettings/colorRange/colorRange.actions";
import {ColorRange} from "../../codeCharta.model";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";
import {setMargin} from "../../state/store/dynamicSettings/margin/margin.actions";
import {FileSelectionState} from "../../model/files/files";

export interface CustomViewItem {
    name: string
    isApplicable: boolean
}

export class CustomViewsController {
    private _viewModel: {
        dropDownCustomViewItems: CustomViewItem[]
    } = {
        dropDownCustomViewItems: []
    }

    constructor(
        private storeService: StoreService,
        private dialogService: DialogService,
        private threeOrbitControlsService: ThreeOrbitControlsService
    ) {
    }

    loadCustomViews() {
        const currentMapName = this.storeService.getState().files.find(
            fileItem => fileItem.selectedAs === FileSelectionState.Single
        ).file.fileMeta.fileName

        this._viewModel.dropDownCustomViewItems = CustomViewHelper.getCustomViewItems(currentMapName)
        this._viewModel.dropDownCustomViewItems.sort(CustomViewHelper.sortCustomViewDropDownList())
    }

    showAddCustomViewSettings() {
        this.dialogService.showAddCustomViewSettings()
    }

    applyCustomView(viewName: string) {
       const customView = CustomViewHelper.getCustomViewSettings(viewName)

        this.storeService.dispatch(setState(customView.stateSettings))
        this.storeService.dispatch(setColorRange(customView.stateSettings.dynamicSettings.colorRange as ColorRange))
        this.storeService.dispatch(setMargin(customView.stateSettings.dynamicSettings.margin))
        this.threeOrbitControlsService.setControlTarget()
        //this.storeService.dispatch(setSearchedNodePaths(customView.stateSettings.dynamicSettings.searchedNodePaths as Set<string>))
    }

    removeCustomView(viewName) {
        CustomViewHelper.deleteCustomView(viewName)
        this.dialogService.showErrorDialog(`${viewName} deleted.`, "Info")
    }
}


export const customViewsComponent = {
    selector: "customViewsComponent",
    template: require("./customViews.component.html"),
    controller: CustomViewsController
}