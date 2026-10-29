import { Page } from "@playwright/test"

/** The files of the startup sample `sample1.cc.json`, as a folder the stand-in picker hands out. */
const SAMPLE_ONE_FOLDER = {
    "bigLeaf.ts": "export const big = 1\nconsole.log(big)\n",
    "sample1OnlyLeaf.scss": ".leaf { color: red; }\n",
    ParentLeaf: { "smallLeaf.html": "<p>small</p>\n", "otherSmallLeaf.ts": "export {}\n" }
}

export type StandInPicker = "sampleFolder" | "unrelatedFolder" | "blockedByPolicy" | "missing"

export class LocalSourcePageObject {
    constructor(private readonly page: Page) {}

    /** Chromium's picker opens a native dialog no test can drive, so a folder in the page's private storage stands in for it. */
    async standInForThePicker(picker: StandInPicker) {
        await this.page.addInitScript(
            ({ picker, sampleFolder }) => {
                const pageWindow = window as unknown as Record<string, unknown>
                pageWindow.openedLinks = []
                pageWindow.open = (url: string) => {
                    ;(pageWindow.openedLinks as string[]).push(url)
                    return null
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
                    const folderName = picker === "sampleFolder" ? "sample1" : "holiday"
                    const folder = await storage.getDirectoryHandle(folderName, { create: true })
                    await fill(folder, picker === "sampleFolder" ? sampleFolder : { "beach.jpg": "sand" })
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

    sourceDialog() {
        return this.page.getByTestId("local-source-dialog")
    }

    editorDialog() {
        return this.page.getByTestId("local-source-editor-dialog")
    }

    folderLines() {
        return this.page.getByTestId("map-local-folder")
    }
}
