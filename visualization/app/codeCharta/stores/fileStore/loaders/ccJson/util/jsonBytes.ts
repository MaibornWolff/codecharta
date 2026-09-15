// V8's maximum string length; UTF-8 needs at least one byte per character, so this many bytes always fit.
const MAX_STRING_BYTES = 2 ** 29 - 24

const QUOTE = 0x22
const BACKSLASH = 0x5c
const COLON = 0x3a
const COMMA = 0x2c
const OPEN_BRACE = 0x7b
const CLOSE_BRACE = 0x7d
const OPEN_BRACKET = 0x5b
const CLOSE_BRACKET = 0x5d
const LAST_WHITESPACE = 0x20

const textDecoder = new TextDecoder()

interface Slice {
    start: number
    end: number
}

export function parseJsonBytes(bytes: Uint8Array, maxSliceBytes = MAX_STRING_BYTES): unknown {
    return parseSlice(bytes, trim(bytes, { start: 0, end: bytes.length }), maxSliceBytes)
}

function parseSlice(bytes: Uint8Array, slice: Slice, maxSliceBytes: number): unknown {
    if (slice.end - slice.start <= maxSliceBytes) {
        return JSON.parse(textDecoder.decode(bytes.subarray(slice.start, slice.end)))
    }
    if (bytes[slice.start] === OPEN_BRACE) {
        return parseObject(bytes, slice, maxSliceBytes)
    }
    if (bytes[slice.start] === OPEN_BRACKET) {
        return memberSlices(bytes, slice, CLOSE_BRACKET).map(item => parseSlice(bytes, item, maxSliceBytes))
    }
    return JSON.parse(textDecoder.decode(bytes.subarray(slice.start, slice.end)))
}

function parseObject(bytes: Uint8Array, slice: Slice, maxSliceBytes: number): Record<string, unknown> {
    const entries = memberSlices(bytes, slice, CLOSE_BRACE).map(member => {
        if (bytes[member.start] !== QUOTE) {
            throw new SyntaxError(`Expected a property name at byte ${member.start}`)
        }
        const keyEnd = closingQuoteIndex(bytes, member.start) + 1
        const colon = trim(bytes, { start: keyEnd, end: member.end }).start
        if (bytes[colon] !== COLON) {
            throw new SyntaxError(`Expected ':' at byte ${colon}`)
        }
        const key = JSON.parse(textDecoder.decode(bytes.subarray(member.start, keyEnd)))
        return [key, parseSlice(bytes, trim(bytes, { start: colon + 1, end: member.end }), maxSliceBytes)]
    })
    return Object.fromEntries(entries)
}

function memberSlices(bytes: Uint8Array, container: Slice, closingByte: number): Slice[] {
    const contentEnd = container.end - 1
    if (bytes[contentEnd] !== closingByte) {
        throw new SyntaxError(`Expected '${String.fromCodePoint(closingByte)}' at byte ${contentEnd}`)
    }
    const members: Slice[] = []
    let depth = 0
    let memberStart = container.start + 1
    for (let index = memberStart; index < contentEnd; index = nextIndex(bytes, index)) {
        const byte = bytes[index]
        if (byte === OPEN_BRACE || byte === OPEN_BRACKET) {
            depth++
        } else if (byte === CLOSE_BRACE || byte === CLOSE_BRACKET) {
            depth--
        } else if (byte === COMMA && depth === 0) {
            members.push(trim(bytes, { start: memberStart, end: index }))
            memberStart = index + 1
        }
    }
    const lastMember = trim(bytes, { start: memberStart, end: contentEnd })
    return members.length === 0 && lastMember.start === lastMember.end ? [] : [...members, lastMember]
}

function nextIndex(bytes: Uint8Array, index: number): number {
    return bytes[index] === QUOTE ? closingQuoteIndex(bytes, index) + 1 : index + 1
}

function closingQuoteIndex(bytes: Uint8Array, openingQuote: number): number {
    let index = openingQuote + 1
    while (bytes[index] !== QUOTE) {
        if (index >= bytes.length) {
            throw new SyntaxError(`Unterminated string starting at byte ${openingQuote}`)
        }
        index += bytes[index] === BACKSLASH ? 2 : 1
    }
    return index
}

function trim(bytes: Uint8Array, slice: Slice): Slice {
    let { start, end } = slice
    while (start < end && bytes[start] <= LAST_WHITESPACE) {
        start++
    }
    while (end > start && bytes[end - 1] <= LAST_WHITESPACE) {
        end--
    }
    return { start, end }
}
