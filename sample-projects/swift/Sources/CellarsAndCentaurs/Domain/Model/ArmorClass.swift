struct ArmorClass {
    let description: String
    var base: Int
    var bonus: Int

    var total: Int { base + bonus }

    init(base: Int, bonus: Int, description: String = CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION) {
        self.base = base
        self.bonus = bonus
        self.description = description
    }
}
