export class FileDownloader {
    static downloadData(data: string, fileName: string) {
        const blob = new Blob([data], { type: "text/json" })
        const mouseEvent = document.createEvent("MouseEvents")
        const link = document.createElement("a")

        link.download = fileName
        link.href = window.URL.createObjectURL(blob)
        link.dataset.downloadurl = ["text/json", link.download, link.href].join(":")
        mouseEvent.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        link.dispatchEvent(mouseEvent)
    }
}
