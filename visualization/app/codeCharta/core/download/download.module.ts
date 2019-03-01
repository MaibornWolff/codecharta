"use strict";

import {DownloadService} from "./download.service";
import "../../state/state.module";

import angular from "angular";

angular.module("app.codeCharta.core.download", ["app.codeCharta.state.settings"])
    .service(
        DownloadService.SELECTOR, DownloadService
    );


