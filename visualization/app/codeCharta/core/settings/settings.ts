import angular from "angular";

import "../url/url.ts";
import "../data/data.ts";
import "../../codeMap/threeViewer/threeViewer.ts";

import {SettingsService} from "./settingsService.ts";

angular.module(
    "app.codeCharta.core.settings",
    [
        "app.codeCharta.core.url",
        "app.codeCharta.core.data",
        "app.codeCharta.codeMap.threeViewer"
    ]
)
    .service(
        SettingsService.SELECTOR, SettingsService
    );

