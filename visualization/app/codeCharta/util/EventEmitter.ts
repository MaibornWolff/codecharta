type Listener<D = undefined> = (data?: D) => void
type AbstractEventMap = Record<string, Listener>

export class EventEmitter<EventMap extends AbstractEventMap> {
    private readonly listeners: Partial<Record<keyof EventMap, Listener[]>> = {}

    on<EventType extends keyof EventMap>(event: EventType, callback: EventMap[EventType]) {
        this.listeners[event] ??= []
        this.listeners[event].push(callback)
    }

    emit<EventType extends keyof EventMap>(event: EventType, data?: Parameters<EventMap[EventType]>[0]) {
        // biome-ignore lint/style/useExplicitLengthCheck: <explanation>
        if (!this.listeners[event]?.length) {
            return false
        }

        for (const listener of this.listeners[event]) {
            listener(data)
        }
        return true
    }
}
