export const validateLocalStorageSize = () => {
    const customLocalStorageLimitInKB = 768
    let allStringsConcatenated = ""
    for (const [key, value] of Object.entries(localStorage)) {
        allStringsConcatenated += key + value
    }

    // It does not exist a limit for the total localStorage size that applies to all browsers.
    // Usually 2MB - 10MB are available (5MB seems to be very common).
    // The localStorage size (e.g. 5MB) is assigned per origin.
    // Multiply localStorage characters by 16 (bits because they are stored in UTF-16).
    // Add 3KB as it seems there is some default overhead.
    const localStorageSizeInKB = 3 + (allStringsConcatenated.length * 16) / 8 / 1024

    return localStorageSizeInKB <= customLocalStorageLimitInKB
}
