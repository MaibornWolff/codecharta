struct Speed: Equatable {
    var feetPerRound: Int

    init(_ feetPerRound: Int) {
        self.feetPerRound = feetPerRound
    }

    static let stationary = Speed(0)
}
