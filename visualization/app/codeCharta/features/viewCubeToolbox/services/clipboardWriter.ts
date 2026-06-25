export async function setToClipboard(blob: Blob) {
    const data = [new ClipboardItem({ [blob.type]: blob })]
    await navigator.clipboard.write(data)
}

export function checkWriteToClipboardAllowed(): boolean {
    return "clipboard" in navigator && "write" in navigator.clipboard
}
