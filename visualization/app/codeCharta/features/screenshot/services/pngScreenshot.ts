/** Hands a PNG data URL to the browser's downloader under the given file name. */
export function downloadPng(dataUrl: string, fileName: string): void {
    const downloadLink = document.createElement("a")
    downloadLink.download = fileName
    downloadLink.href = dataUrl
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
}
