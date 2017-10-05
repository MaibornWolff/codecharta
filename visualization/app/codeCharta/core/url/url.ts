"use strict";

import angular from "angular";

import {UrlService} from "./urlService.ts";

angular.module("app.codeCharta.core.url",[]);

angular.module("app.codeCharta.core.url").service("urlService", UrlService);