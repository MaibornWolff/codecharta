export function downloadPng(dataUrl: string, fileName: string): void {
    const downloadLink = document.createElement("a")
    downloadLink.download = fileName
    downloadLink.href = dataUrl
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
}
