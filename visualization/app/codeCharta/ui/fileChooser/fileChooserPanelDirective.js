"use strict";

/**
 * Renders the file chooser panel
 */
class FileChooserPanelDirective{

    /**
     * @constructor
     */
    constructor() {

        /**
         * unique id of the current filechooser
         * @type {number}
         */
        this.uniqueId = 0;

        /**
         *
         * @type {string}
         */
        this.template = require("./fileChooserPanel.html");

        /**
         *
         * @type {string}
         */
        this.restrict = "E";
    }

    /**
     * links the modal function to the correct element
     */
    link() {
    	$("#fileChooserPanel").modal("");
    }

}

export {FileChooserPanelDirective};
