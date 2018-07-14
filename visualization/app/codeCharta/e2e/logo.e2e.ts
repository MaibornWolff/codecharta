import {CC_URL, puppeteer} from "../../puppeteer.helper";
import {LogoPageObject} from "./logo.po";

jest.setTimeout(10000);

describe("CodeCharta logo tests",()=>{

    let browser, page, logo;

    beforeAll(async ()=>{
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.goto(CC_URL);
        logo = new LogoPageObject(page);
    });

    afterAll(async ()=>{
        await browser.close();
    });

    it("check version", async ()=>{
        expect(await logo.getVersion()).toBe(require("../../../package.json").version);
    });

    it("check link", async ()=>{
        expect(await logo.getLink()).toContain("maibornwolff.de");
    });

    it("check image of logo against expected snapshot", async ()=>{
        const src = await logo.getImageSrc();
        const viewSource = await page.goto(src);
        expect(await viewSource.buffer()).toMatchSnapshot();
    });

});