interface ApiVersion {
    major: number
    minor: number
}

export function getAsApiVersion(version: string): ApiVersion {
    return {
        major: Number(version.split(".")[0]),
        minor: Number(version.split(".")[1])
    }
}
