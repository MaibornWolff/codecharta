import { Page } from "@playwright/test"

/** The files of the startup sample `sample1.cc.json`, as a folder the stand-in picker hands out. */
const SAMPLE_ONE_FOLDER = {
    "bigLeaf.ts": "export const big = 1\nconsole.log(big)\n",
    "sample1OnlyLeaf.scss": ".leaf { color: red; }\n",
    ParentLeaf: { "smallLeaf.html": "<p>small</p>\n", "otherSmallLeaf.ts": "export {}\n" }
}

export type StandInPicker = "sampleFolder" | "sampleFolderWithLargeFiles" | "unrelatedFolder" | "blockedByPolicy" | "missing"

export class LocalSourcePageObject {
    constructor(private readonly page: Page) {}

    /** Chromium's picker opens a native dialog no test can drive, so a folder in the page's private storage stands in for it. */
    async standInForThePicker(picker: StandInPicker) {
        await this.page.addInitScript(
            ({ picker, sampleFolder }) => {
                const pageWindow = window as unknown as Record<string, unknown>
                pageWindow.openedLinks = []
                pageWindow.blankTabs = []
                pageWindow.open = (url: string) => {
                    ;(pageWindow.blankTabs as string[]).push(url)
                    return null
                }
                const clickLink = HTMLAnchorElement.prototype.click
                HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
                    if (this.protocol === "vscode:") {
                        ;(pageWindow.openedLinks as string[]).push(this.href)
                    } else {
                        clickLink.call(this)
                    }
                }
                if (picker === "missing") {
                    delete pageWindow.showDirectoryPicker
                    return
                }
                type Tree = { [name: string]: string | Tree }
                const fill = async (folder: FileSystemDirectoryHandle, tree: Tree) => {
                    for (const [name, content] of Object.entries(tree)) {
                        if (typeof content === "string") {
                            const writable = await (await folder.getFileHandle(name, { create: true })).createWritable()
                            await writable.write(content)
                            await writable.close()
                        } else {
                            await fill(await folder.getDirectoryHandle(name, { create: true }), content)
                        }
                    }
                }
                pageWindow.showDirectoryPicker = async () => {
                    if (picker === "blockedByPolicy") {
                        throw new DOMException("Blocked by the administrator", "SecurityError")
                    }
                    const storage = await navigator.storage.getDirectory()
                    if (picker === "unrelatedFolder") {
                        const holiday = await storage.getDirectoryHandle("holiday", { create: true })
                        await fill(holiday, { "beach.jpg": "sand" })
                        return holiday
                    }
                    const folder = await storage.getDirectoryHandle("sample1", { create: true })
                    await fill(folder, sampleFolder)
                    if (picker === "sampleFolderWithLargeFiles") {
                        await fill(folder, {
                            "bigLeaf.ts": `export const big = [${"1,".repeat(3 * 1024 * 1024)}1]\n`,
                            "sample1OnlyLeaf.scss": `.leaf{${"color:red;".repeat(3000)}}\n`
                        })
                    }
                    return folder
                }
            },
            { picker, sampleFolder: SAMPLE_ONE_FOLDER }
        )
    }

    async openSettings() {
        await this.page.getByRole("button", { name: "Settings", exact: true, description: "Global Configuration" }).click()
        await this.page.getByText("Global Configuration").waitFor()
    }

    async switchOn() {
        await this.openSettings()
        await this.page.getByLabel("Open local source files (experimental)").check()
        await this.page.keyboard.press("Escape")
    }

    openedLinks(): Promise<string[]> {
        return this.page.evaluate(() => (window as unknown as { openedLinks: string[] }).openedLinks)
    }

    blankTabs(): Promise<string[]> {
        return this.page.evaluate(() => (window as unknown as { blankTabs: string[] }).blankTabs)
    }

    /** Only the keys: reading a saved handle back crashes the Chromium of the Linux sandbox. */
    savedFolderKeys(): Promise<string[]> {
        return this.page.evaluate(
            () =>
                new Promise<string[]>((resolve, reject) => {
                    const opening = indexedDB.open("CodeChartaLocalSource", 1)
                    opening.onerror = () => reject(opening.error)
                    opening.onsuccess = () => {
                        const reading = opening.result.transaction("folders").objectStore("folders").getAllKeys()
                        reading.onsuccess = () => {
                            opening.result.close()
                            resolve(reading.result as string[])
                        }
                    }
                })
        )
    }

    openMapSelector() {
        return this.page.locator("cc-map-selector .dropdown > button").click()
    }

    folderDialog() {
        return this.page.getByTestId("local-source-folder-dialog").locator("visible=true")
    }

    selectFolderInTheDialog() {
        return this.folderDialog().getByRole("button", { name: "Select folder…" }).click()
    }

    sourceDialog() {
        return this.page.getByTestId("local-source-dialog")
    }

    editorDialog() {
        return this.page.getByTestId("local-source-editor-dialog").locator("visible=true")
    }

    folderLines() {
        return this.page.getByTestId("map-local-folder")
    }
}
