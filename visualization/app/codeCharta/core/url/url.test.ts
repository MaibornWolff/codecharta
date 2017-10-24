import {ng} from "../../../ng.mockhelper.ts";

import {UrlService} from "./url.service.ts";
import "./url.module.ts";

test('UrlService has correct selector', () => {
    expect(UrlService.SELECTOR).toBe("urlService");
});

test('angular can create url module instance', () => {
    console.log(ng.mock);
});
