import {FileChooserController} from "./fileChooserController";

/**
 * Renders the current file chooser
 */
export class FileChooserDirective{

    public template = require("./fileChooser.html");
    public restrict = "E";
    public scope = {};
    public controller = FileChooserController;
    public controllerAs = "ctrl";
    public bindToController = true;
    public uniqueId = 0;

    /**
     * Links the uniqe id to the scope id and increments it
     * @param {Scope} $scope
     */
    public link($scope) {
        $scope.id = "fileChooser" + (this.uniqueId++);
    }

}