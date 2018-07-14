import {CC_URL, puppeteer} from "../../puppeteer.helper";

jest.setTimeout(10000);

export class LogoPageObject {

    constructor(private page) {}

    async getVersion() {
        const versionString = await this.page.evaluate(() => document.querySelector('#title > div > h2 > span').innerText);
        return versionString.split(" ")[1];
    }

    async getLink() {
        return await this.page.evaluate(() => document.querySelector('#title > div > a').href);
    }

    async getImageSrc() {
        return await this.page.evaluate(() => document.querySelector('#title > div > a > img').src);
    }

}

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