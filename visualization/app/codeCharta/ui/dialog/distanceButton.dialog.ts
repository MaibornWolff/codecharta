import {ThreeCameraService} from "../codeMap/threeViewer/threeCameraService";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";
import {SettingsService} from "../../core/settings/settings.service";

export class ButtonDialogController {


    constructor(private $mdDialog,
                private threeCameraService: ThreeCameraService,
                private settingsService: SettingsService,
                private  threeOrbitControlsService: ThreeOrbitControlsService) {
    }

    updateDistance(){
        ThreeCameraService.FAR = ThreeOrbitControlsService.DISTANCE_CAMERA_BOTTOM;
        this.threeCameraService.init(
            this.settingsService,
            window.innerWidth,
            window.innerHeight,
            this.settingsService.settings.camera.x,
            this.settingsService.settings.camera.y,
            this.settingsService.settings.camera.z
        );
        this.threeOrbitControlsService.autoFitTo();
        this.$mdDialog.hide();
    }
}

export const distanceButtonDialog ={
        clickOutsideToClose: true,
        title: "HELLO",
        template: require("./distanceButton.dialog.html"),//TODO why is the pop up so ugly? find right class
        controller: ButtonDialogController,
        controllerAs: "$ctrl"
};