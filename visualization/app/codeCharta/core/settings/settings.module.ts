import angular from "angular";

import "../url/url.module";
import "../data/data.module";
import "../statistic/statistic.module";
import "../../ui/codeMap/threeViewer/threeViewer";

import {SettingsService} from "./settings.service";

angular.module(
    "app.codeCharta.core.settings",
    [
        "app.codeCharta.core.url",
        "app.codeCharta.core.data",
        "app.codeCharta.ui.codeMap.threeViewer",
        "app.codeCharta.core.statistic"
    ]
)
    .service(
        SettingsService.SELECTOR, SettingsService
    );

