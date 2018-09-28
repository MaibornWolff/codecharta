"use strict";

import angular from "angular";
import {MultipleMapService} from "./multiple.service";
import "../../ui/dialog/dialog";

angular.module(
    "app.codeCharta.core.multiple", ["app.codeCharta.ui.dialog"]
).service(
    MultipleMapService.SELECTOR, MultipleMapService
);

