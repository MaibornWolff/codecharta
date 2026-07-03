export interface ErrorDialogData {
    title: string
    message: string
    resolveErrorData?: { buttonText: string; onResolveErrorClick: () => void }
}
