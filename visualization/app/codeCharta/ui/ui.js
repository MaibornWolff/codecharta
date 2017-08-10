"use strict";

import "./common/common.js";
import "./fabBar/fabBar.js";
import "./settingsPanel/settingsPanel.js";
import "./revisionChooser/revisionChooser.js";
import "./legendPanel/legendPanel.js";
import "./fileChooser/fileChooser.js";
import "./detailPanel/detailPanel.js";
import "./scenarioButtons/scenarioButtons.js";
import "./loadingPanel/loadingPanel.js";

angular.module("app.codeCharta.ui", ["app.codeCharta.ui.common", "app.codeCharta.ui.fabBar", "app.codeCharta.ui.settingsPanel", "app.codeCharta.ui.revisionChooser", "app.codeCharta.ui.legendPanel", "app.codeCharta.ui.fileChooser", "app.codeCharta.ui.detailPanel", "app.codeCharta.ui.scenarioButtons", "app.codeCharta.ui.loadingPanel"]);

