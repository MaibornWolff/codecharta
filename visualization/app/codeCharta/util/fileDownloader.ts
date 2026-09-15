export class FileDownloader {
    static downloadData(data: string, fileName: string) {
        const blob = new Blob([data], { type: "text/json" })
        const link = document.createElement("a")

        link.download = fileName
        link.href = window.URL.createObjectURL(blob)
        link.dataset.downloadurl = ["text/json", link.download, link.href].join(":")
        link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: false, view: window }))
    }
}
