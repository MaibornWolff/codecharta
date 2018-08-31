import {CC_URL, puppeteer} from "../../puppeteer.helper";
import {RevisionChooserPageObject} from "../ui/revisionChooser/revisionChooser.po";
import {ErrorDialogPageObject} from "../ui/dialog/errorDialog.po";
import {ActionButtonsPageObject} from "./actionButtons.po";
import {SettingsPanelPageObject} from "../ui/settingsPanel/settingsPanel.po";

jest.setTimeout(15000);

describe("codecharta",()=>{

    let browser, page;

    beforeEach(async ()=>{
        browser = await puppeteer.launch(
            {
                headless: true,
                args: ["--allow-file-access-from-files"]
            }
        );
        page = await browser.newPage();
    });

    afterEach(async ()=>{
        await browser.close();
    });

    async function navigateToRevisionChooser() {
        let actionButtons = new ActionButtonsPageObject(page);
        await page.waitFor(3000);
        await actionButtons.toggleSideMenu();
        let settingsPanel = new SettingsPanelPageObject(page);
        await page.waitFor(1000);
        return settingsPanel.toggleMapsPanel();
    }

    async function handleErrorDialog() {
        let errorDialog = new ErrorDialogPageObject(page);
        let msg = await errorDialog.getMessage();
        expect(msg).toEqual("One or more files from the given file URL parameter could not be loaded. Loading sample files instead.");
        await page.waitFor(1000);
        return errorDialog.clickOk();
    }

    async function checkSelectedRevisionName(shouldBe: string) {
        let revisionChooser = new RevisionChooserPageObject(page);
        await page.waitFor(1000);
        let name = await revisionChooser.getSelectedName();
        expect(name).toEqual(shouldBe);
    }

    async function checkAllRevisionNames(shouldBe: string[]) {
        let revisionChooser = new RevisionChooserPageObject(page);
        await page.waitFor(1000);
        await revisionChooser.clickChooser();
        await page.waitFor(1000);
        let names = await revisionChooser.getAllNames();
        expect(names).toEqual(shouldBe);
    }

    async function mockResponses() {
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.url().includes("/fileOne.json")) {
                request.respond({
                    content: 'application/json',
                    headers: {"Access-Control-Allow-Origin": "*"},
                    body: JSON.stringify(require("../assets/sample2.json"))
                });
            } else if (request.url().includes("/fileTwo.json")) {
                request.respond({
                    content: 'application/json',
                    headers: {"Access-Control-Allow-Origin": "*"},
                    body: JSON.stringify(require("../assets/sample3.json"))
                });
            }
            else {
                request.continue();
            }
        });
    }

    xit("should load data when file parameters in url are valid", async ()=>{
        await mockResponses();
        await page.goto(CC_URL + "?file=fileOne.json&file=fileTwo.json");
        await navigateToRevisionChooser();
        await checkSelectedRevisionName("fileOne.json");
        await checkAllRevisionNames(["fileOne.json", "fileTwo.json"]);
    });

    xit("should throw errors when file parameters in url are invalid and load sample data instead", async ()=>{
        await page.goto(CC_URL + "?file=invalid234");
        await handleErrorDialog();
        await navigateToRevisionChooser();
        await checkSelectedRevisionName("sample1.json");
        await checkAllRevisionNames(["sample1.json", "sample2.json"]);
    });

});