"use strict";

import {DownloadService} from "./download.service";
import "../settings/settings.module";

import angular from "angular";

angular.module("app.codeCharta.core.download", ["app.codeCharta.core.settings"])
    .service(
        DownloadService.SELECTOR, DownloadService
    );


