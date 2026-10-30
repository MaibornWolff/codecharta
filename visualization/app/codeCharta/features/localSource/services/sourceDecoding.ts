export interface DecodedSource {
    text: string
    encoding: string
}

const UTF_16_BY_BYTE_ORDER_MARK = [
    { firstByte: 0xff, secondByte: 0xfe, label: "utf-16le", encoding: "UTF-16 LE" },
    { firstByte: 0xfe, secondByte: 0xff, label: "utf-16be", encoding: "UTF-16 BE" }
]

/** Null for a file that is not text. Text that is not valid UTF-8 is most likely in the older Western encoding. */
export function decodeSource(bytes: Uint8Array): DecodedSource | null {
    const utf16 = UTF_16_BY_BYTE_ORDER_MARK.find(({ firstByte, secondByte }) => bytes[0] === firstByte && bytes[1] === secondByte)
    if (utf16) {
        return { text: new TextDecoder(utf16.label).decode(bytes), encoding: utf16.encoding }
    }
    if (bytes.includes(0)) {
        return null
    }
    try {
        return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes), encoding: "UTF-8" }
    } catch {
        return { text: new TextDecoder("windows-1252").decode(bytes), encoding: "Windows-1252" }
    }
}
