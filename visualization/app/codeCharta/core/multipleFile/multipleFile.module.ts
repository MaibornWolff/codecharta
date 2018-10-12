"use strict";

import angular from "angular";
import {MultipleFileService} from "./multipleFile.service";
import "../../ui/dialog/dialog";

angular.module(
    "app.codeCharta.core.multiple", ["app.codeCharta.ui.dialog"]
).service(
    MultipleFileService.SELECTOR, MultipleFileService
);

