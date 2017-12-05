"use strict";

import angular from "angular";

import {UrlService} from "./url.service";

angular.module(
    "app.codeCharta.core.url",
    []
).service(
    UrlService.SELECTOR,
    UrlService
);