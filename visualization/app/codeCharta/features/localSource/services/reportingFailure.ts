import { ToastService } from "../../shared/facade"

export const READING_FAILED = "Could not read the local folder"
export const SAVING_FAILED = "Could not save the local folder"

export async function reportingFailure<T>(toast: ToastService, whatFailed: string, work: () => Promise<T>): Promise<T | null> {
    try {
        return await work()
    } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown error"
        toast.show(`${whatFailed}: ${reason}`, "error")
        return null
    }
}
