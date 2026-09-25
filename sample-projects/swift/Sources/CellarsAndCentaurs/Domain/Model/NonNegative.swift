@propertyWrapper
struct NonNegative {
    private var storedValue: Int

    var wrappedValue: Int {
        get { storedValue }
        set { storedValue = max(0, newValue) }
    }

    init(wrappedValue: Int) {
        storedValue = max(0, wrappedValue)
    }
}
