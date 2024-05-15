import { gzip } from "pako"
import { readFiles } from "./readFiles"

describe("readFiles", () => {
    it("should read a file", async () => {
        const files = [new File([new Blob(["hello world"])], "file.json")] as unknown as FileList
        const [readContent] = await Promise.all(readFiles(files))
        expect(readContent).toBe("hello world")
    })

    it("should read a zipped file", async () => {
        const files = [new File([gzip("hello world")], "file.json.gz")] as unknown as FileList
        const [readContent] = await Promise.all(readFiles(files))
        expect(readContent).toBe("hello world")
    })
})
