import {ThreeCameraService} from "../codeMap/threeViewer/threeCameraService";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";

export class ButtonDialogController {


    constructor(private $mdDialog) {
    }

    updateDistance(){//TODO this function is not being called
        ThreeCameraService.FAR = ThreeOrbitControlsService.DISTANCE_CAMERA_BOTTOM;
        console.log("ThreeCameraService.FAR");
        console.log(ThreeCameraService.FAR);
        this.$mdDialog.hide();
    }
}

export const distanceButtonDialog ={
        clickOutsideToClose: true,
        title: "HELLO",
        template: require("./distanceButton.dialog.html"),//TODO why is the pop up so ugly?
        controller: ButtonDialogController,
        controllerAs: "$ctrl"
};