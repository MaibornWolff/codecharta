"use strict";

import angular from "angular";

import "./common/common.ts";
import "./fabBar/fabBar.ts";
import "./settingsPanel/index.ts";
import "./revisionChooser/revisionChooser.ts";
import "./legendPanel/legendPanel.ts";
import "./fileChooser/fileChooser.js";
import "./detailPanel/detailPanel.ts";
import "./scenarioButtons/scenarioButtons.ts";

angular.module("app.codeCharta.ui", ["app.codeCharta.ui.common", "app.codeCharta.ui.fabBar", "app.codeCharta.ui.settingsPanel", "app.codeCharta.ui.revisionChooser", "app.codeCharta.ui.legendPanel", "app.codeCharta.ui.fileChooser", "app.codeCharta.ui.detailPanel", "app.codeCharta.ui.scenarioButtons"]);

