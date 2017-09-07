"use strict";

import {CodeChartaController} from "./codeChartaController";

/**
 * This directive is the entry point of the CodeCharta application
 */
class CodeChartaDirective {

    constructor() {
        this.template = require("./codeCharta.html");
        this.restrict = "E";
        this.scope = {};
        this.controller = CodeChartaController;
        this.controllerAs = "ctrl";
        this.bindToController = true;
    }

}

export {CodeChartaDirective};

