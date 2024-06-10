export interface SizeChangeOptions {}
export interface SizeChangeStrategy {
    execute(sizeChangeOptions: SizeChangeOptions): Promise<void>
}
