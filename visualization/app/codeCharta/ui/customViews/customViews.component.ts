import "./customViews.component.scss"
import {DialogService} from "../dialog/dialog.service";
import {CustomViewHelper} from "../../util/customViewHelper";
import {StoreService} from "../../state/store.service";
import {setState} from "../../state/store/state.actions";
import {setColorRange} from "../../state/store/dynamicSettings/colorRange/colorRange.actions";
import {ColorRange} from "../../codeCharta.model";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";
import {setMargin} from "../../state/store/dynamicSettings/margin/margin.actions";
import {FileState} from "../../model/files/files";
import {FilesSelectionSubscriber, FilesService} from "../../state/store/files/files.service";
import {IRootScopeService} from "angular";
import {CustomViewFileStateConnector} from "./customViewFileStateConnector";
import {CustomViewMapSelectionMode} from "../../model/customView/customView.api.model";
import {ThreeCameraService} from "../codeMap/threeViewer/threeCameraService";
import {setCamera} from "../../state/store/appSettings/camera/camera.actions";
import {setCameraTarget} from "../../state/store/appSettings/cameraTarget/cameraTarget.actions";
import {Vector3} from "three";

export interface CustomViewItem {
    name: string
    mapName: string
    mapSelectionMode: CustomViewMapSelectionMode
    isApplicable: boolean
}

export class CustomViewsController implements FilesSelectionSubscriber {
    private _viewModel: {
        dropDownCustomViewItems: CustomViewItem[]
    } = {
        dropDownCustomViewItems: []
    }

    private customViewFileStateConnector: CustomViewFileStateConnector

    constructor(
        private $rootScope: IRootScopeService,
        private storeService: StoreService,
        private dialogService: DialogService,
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private threeCameraService: ThreeCameraService,
    ) {
        FilesService.subscribe(this.$rootScope, this)
    }

    onFilesSelectionChanged(files: FileState[]) {
        this.customViewFileStateConnector = new CustomViewFileStateConnector(files)
    }

    loadCustomViews() {
        this._viewModel.dropDownCustomViewItems = CustomViewHelper.getCustomViewItems(this.customViewFileStateConnector)
        this._viewModel.dropDownCustomViewItems.sort(CustomViewHelper.sortCustomViewDropDownList())
    }

    showAddCustomViewSettings() {
        this.dialogService.showAddCustomViewSettings()
    }

    applyCustomView(viewName: string) {
        const customView = CustomViewHelper.getCustomViewSettings(viewName)

        // TODO: Setting state from loaded CustomView not working at the moment
        //  due to issues of the event architecture.

        // TODO: Check if state properties differ
        // Create new partial State (updates) for changed values only
        this.storeService.dispatch(setState(customView.stateSettings))

        // Should we fire another event "ResettingStateFinishedEvent"
        // We could add a listener then to reset the camera

        this.storeService.dispatch(setColorRange(customView.stateSettings.dynamicSettings.colorRange as ColorRange))
        this.storeService.dispatch(setMargin(customView.stateSettings.dynamicSettings.margin))

        // TODO: remove this dirty timeout and set camera settings properly
        // This timeout is a chance that CustomViews for a small map can be restored and applied completely (even the camera positions)
        setTimeout( () => {
            this.threeCameraService.setPosition()
            this.threeOrbitControlsService.setControlTarget()

            this.storeService.dispatch(setCamera(customView.stateSettings.appSettings.camera as Vector3))
            this.storeService.dispatch(setCameraTarget(customView.stateSettings.appSettings.cameraTarget as Vector3))
        }, 100 );
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