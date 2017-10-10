"use strict";

import angular from "angular";

import "./common/common.js";
import "./fabBar/fabBar.js";
import "./settingsPanel/index.ts";
import "./revisionChooser/revisionChooser.ts";
import "./legendPanel/legendPanel.js";
import "./fileChooser/fileChooser.js";
import "./detailPanel/detailPanel.js";
import "./scenarioButtons/scenarioButtons.ts";

angular.module("app.codeCharta.ui", ["app.codeCharta.ui.common", "app.codeCharta.ui.fabBar", "app.codeCharta.ui.settingsPanel", "app.codeCharta.ui.revisionChooser", "app.codeCharta.ui.legendPanel", "app.codeCharta.ui.fileChooser", "app.codeCharta.ui.detailPanel", "app.codeCharta.ui.scenarioButtons"]);

