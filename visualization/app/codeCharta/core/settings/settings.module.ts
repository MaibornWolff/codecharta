import angular from "angular";

import "../url/url.module.ts";
import "../data/data.module.ts";
import "../../codeMap/threeViewer/threeViewer.ts";

import {SettingsService} from "./settings.service.ts";

angular.module(
    "app.codeCharta.core.settings",
    [
        "app.codeCharta.core.url",
        "app.codeCharta.core.data",
        "app.codeCharta.codeMap.threeViewer",
        "app.codeCharta.core.statistic"
    ]
)
    .service(
        SettingsService.SELECTOR, SettingsService
    );

