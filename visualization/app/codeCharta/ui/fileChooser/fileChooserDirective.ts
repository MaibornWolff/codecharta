import {FileChooserController} from "./fileChooserController";

/**
 * Renders the current file chooser
 */
export class FileChooserDirective{

    template = require("./fileChooser.html");
    restrict = "E";
    scope = {};
    controller = FileChooserController;
    controllerAs = "ctrl";
    bindToController = true;
    uniqueId = 0;

    constructor() {}

    /**
     * Links the uniqe id to the scope id and increments it
     * @param {Scope} $scope
     */
    link($scope) {
        $scope.id = "fileChooser" + (this.uniqueId++);
    }

}