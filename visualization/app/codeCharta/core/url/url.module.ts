"use strict";

import angular from "angular";

import {UrlUtils} from "../../util/urlUtils";

angular.module(
    "app.codeCharta.core.url",
    []
).service(
    UrlUtils.SELECTOR,
    UrlUtils
);