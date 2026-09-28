/// Hit points drop when the creature takes damage and recover when it rests in its lair.
struct HitPoints {
    static let MAX_HIT_POINTS = 999

    @NonNegative var current: Int
    let maximum: Int
    var temporary: Int

    init(current: Int, maximum: Int, temporary: Int = 0) {
        self.current = current
        self.maximum = min(maximum, HitPoints.MAX_HIT_POINTS)
        self.temporary = temporary
    }

    static func full(_ maximum: Int) -> HitPoints {
        HitPoints(current: maximum, maximum: maximum)
    }

    func damaged(by amount: Int) -> HitPoints {
        HitPoints(current: current - amount, maximum: maximum, temporary: temporary)
    }

    func rested() -> HitPoints {
        HitPoints.full(maximum)
    }
}
