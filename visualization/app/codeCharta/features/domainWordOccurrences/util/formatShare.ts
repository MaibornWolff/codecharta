const PERCENT_PER_SHARE = 100

export function formatShare(share: number): string {
    const percent = share * PERCENT_PER_SHARE
    if (percent > 0 && percent < 1) {
        return "<1%"
    }
    return `${Math.round(percent)}%`
}
