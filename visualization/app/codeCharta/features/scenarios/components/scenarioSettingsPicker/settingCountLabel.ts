export function settingCountLabel(count: number): string {
    return `${count} ${count === 1 ? "setting" : "settings"}`
}
