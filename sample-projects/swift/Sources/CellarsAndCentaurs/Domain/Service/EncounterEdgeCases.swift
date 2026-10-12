import Foundation

// MARK: - guardElse
func guardElse(_ creature: Creature?) -> Int {
    guard let creature = creature else {
        return 0
    }
    return creature.speeds.count
}

// MARK: - ifLet
func ifLet(_ creature: Creature) -> Int {
    if let hitPoints = creature.hitPoints, hitPoints.current > 0 {
        return hitPoints.current
    }
    return 0
}

// MARK: - ifCase
func ifCase(_ speedType: SpeedType) -> Bool {
    if case .flying = speedType {
        return true
    }
    return false
}

// MARK: - switchPatterns
func switchPatterns(_ roll: Int, _ type: CreatureType) -> String {
    switch (roll, type) {
    case (1, _):
        return "fumble"
    case (2...9, .beast), (2...9, .humanoid):
        return "graze"
    case (let value, .dragon) where value > 15:
        return "scorch"
    case (10..<20, _):
        return "hit"
    default:
        return "critical"
    }
}

// MARK: - fallthroughCase
func fallthroughCase(_ level: Int) -> Int {
    var treasure = 0
    switch level {
    case 3:
        treasure += 30
        fallthrough
    case 2:
        treasure += 20
        fallthrough
    case 1:
        treasure += 10
    default:
        break
    }
    return treasure
}

// MARK: - forWhere
func forWhere(_ creatures: [Creature]) -> Int {
    var undead = 0
    for creature in creatures where creature.type == .undead {
        undead += 1
    }
    return undead
}

// MARK: - repeatWhile
func repeatWhile(_ dice: Dice) -> Int {
    var attempts = 0
    repeat {
        attempts += 1
    } while dice.roll().value < 10
    return attempts
}

// MARK: - labelledBreak
func labelledBreak(_ grid: [[Int]]) -> Int {
    var found = 0
    outer: for row in grid {
        for cell in row {
            if cell < 0 {
                continue outer
            }
            if cell == 0 {
                break outer
            }
            found += cell
        }
    }
    return found
}

// MARK: - patternLoops
func patternLoops(_ rolls: [Int?]) -> Int {
    var total = 0
    for case let roll? in rolls {
        total += roll
    }
    var iterator = rolls.makeIterator()
    while let next = iterator.next(), let value = next {
        total += value
    }
    for index in stride(from: 0, to: 10, by: 2) where index != 4 {
        total += index
    }
    return total
}

// MARK: - deferBlock
func deferBlock(_ dice: Dice) -> Int {
    var rolls = 0
    defer {
        rolls += 1
    }
    return dice.roll().value
}

// MARK: - enumCases
enum DiceError: Error {
    case broken
    case lost, stolen
}

// MARK: - typedCatches
func typedCatches(_ dice: Dice) -> Int {
    do {
        return try dice.checkedRoll().value
    } catch DiceError.broken {
        return 1
    } catch let error as NoSuchCreatureException {
        return error.id.value.count
    } catch DiceError.lost, DiceError.stolen {
        return 2
    } catch {
        return 0
    }
}

// MARK: - catchWhere
func catchWhere(_ dice: Dice) -> Int {
    do {
        return try dice.checkedRoll().value
    } catch let error as DiceError where error == .lost {
        return 2
    } catch {
        return 0
    }
}

// MARK: - tryOptional
func tryOptional(_ dice: Dice) -> Int {
    let careful = try? dice.checkedRoll().value
    let reckless = try! dice.checkedRoll().value
    return (careful ?? 0) + reckless
}

// MARK: - nilCoalescing
func nilCoalescing(_ creature: Creature?) -> Int {
    return creature?.hitPoints?.current ?? creature?.armorClass?.total ?? 0
}

// MARK: - optionalChain
func optionalChain(_ creature: Creature?) -> Int? {
    return creature?.hitPoints?.rested().damaged(by: 1).rested().damaged(by: 2).current
}

// MARK: - shorthandClosures
func shorthandClosures(_ creatures: [Creature]) -> [Int] {
    let alive = creatures.filter { $0.hitPoints != nil }
    let sorted = alive.sorted { $0.speeds.count < $1.speeds.count }
    return sorted.map { $0.speeds.count > 2 ? 2 : $0.speeds.count }
}

// MARK: - functionalChain
func functionalChain(_ creatures: [Creature]) -> Int {
    return creatures
        .filter { $0.type == .dragon || $0.type == .fiend }
        .map { $0.speeds.count }
        .filter { $0 > 1 }
        .reduce(0) { $0 + $1 }
}

// MARK: - trailingClosures
func attempt(_ check: @autoclosure () -> Bool, onSuccess: (Int) -> Void, onFailure: (Int, String) -> Void) {
    if check() {
        onSuccess(1)
    } else {
        onFailure(0, "missed")
    }
}

func attemptTwice() {
    attempt(1 > 0) { value in
        print(value)
    } onFailure: { value, reason in
        print(value, reason)
    }
}

// MARK: - initDeinitSubscript
final class TreasureHoard {
    private var coins: [Int]

    init(coins: [Int] = []) {
        self.coins = coins
    }

    convenience init?(single coin: Int) {
        if coin < 0 {
            return nil
        }
        self.init(coins: [coin])
    }

    deinit {
        coins.removeAll()
    }

    subscript(index: Int) -> Int {
        get {
            return index < coins.count ? coins[index] : 0
        }
        set {
            if index < coins.count {
                coins[index] = newValue
            }
        }
    }
}

// MARK: - propertyAccessors
struct LairGate {
    private var storedWidth = 0

    var height = 0 {
        willSet {
            if newValue < 0 {
                storedWidth = 0
            }
        }
        didSet {
            if height > 10 {
                height = 10
            }
        }
    }

    var width: Int {
        get {
            return storedWidth
        }
        set {
            storedWidth = newValue < 0 ? 0 : newValue
        }
    }

    var area: Int { width * height }

    lazy var label: String = {
        return width > height ? "wide" : "tall"
    }()
}

// MARK: - operatorFunctions
extension Speed {
    static func + (left: Speed, right: Speed) -> Speed {
        return Speed(left.feetPerRound + right.feetPerRound)
    }

    static prefix func - (speed: Speed) -> Speed {
        return Speed(-speed.feetPerRound)
    }

    static func < (left: Speed, right: Speed) -> Bool {
        return left.feetPerRound < right.feetPerRound
    }
}

infix operator <=>: ComparisonPrecedence

func <=> (left: Dice, right: Dice) -> Bool {
    return left.sides == right.sides || left.sides > 100 && right.sides > 100
}

// MARK: - protocolDefault
protocol Wanderer {
    var steps: Int { get }
    func wander() -> Int
}

extension Wanderer {
    func wander() -> Int {
        return steps > 0 ? steps : 1
    }
}

// MARK: - argumentLabels
func move(_ creature: Creature, from start: Int, to end: Int, by speedType: SpeedType = .walking, _: Bool) -> Int {
    return end - start
}

// MARK: - variadicInout
func heal(_ hitPoints: inout HitPoints, by amounts: Int..., limit: Int = 10) {
    for amount in amounts {
        hitPoints = hitPoints.damaged(by: -amount)
    }
}

// MARK: - genericWhere
func strongest<T: Fightable, C: Collection>(_ fighters: C, default fallback: T) -> T where C.Element == T {
    return fighters.first ?? fallback
}

// MARK: - asyncAwait
func summon(_ ids: [CreatureId], from creatures: Creatures, ticks: AsyncStream<Int>) async throws -> [Creature] {
    var summoned: [Creature] = []
    for id in ids {
        if let creature = try await creatures.find(id) {
            summoned.append(creature)
        }
    }
    for await tick in ticks {
        print(tick)
    }
    async let scout = creatures.find(ids[0])
    _ = try await scout
    return summoned
}

// MARK: - actorMethods
actor InitiativeTracker {
    private var order: [Int] = []

    func add(_ initiative: Int) {
        order.append(initiative)
    }

    nonisolated func title() -> String {
        return "initiative tracker"
    }
}

// MARK: - compilationConditions
func platformLair() -> String {
    #if os(Linux) && DEBUG
    let lair = "cave"
    #elseif os(macOS) || os(iOS)
    let lair = "orchard"
    #else
    let lair = "cellar"
    #endif
    if #available(macOS 13, *) {
        return lair
    }
    return lair + "-legacy"
}

// MARK: - macroExpressions
func macroExpressions() -> String {
    #warning("the hoard is unguarded")
    return "\(#function) at \(#line) in \(#fileID)"
}

// MARK: - resultBuilder
@resultBuilder
enum EncounterBuilder {
    static func buildBlock(_ parts: [String]...) -> [String] {
        return parts.flatMap { $0 }
    }

    static func buildExpression(_ part: String) -> [String] {
        return [part]
    }

    static func buildEither(first part: [String]) -> [String] {
        return part
    }
}

@EncounterBuilder
func encounterLog(_ roll: Int) -> [String] {
    "initiative"
    if roll > 10 {
        "ambush"
    } else {
        "parley"
    }
    "treasure"
}

// MARK: - ifSwitchExpressions
func ifSwitchExpressions(_ roll: Int) -> String {
    let outcome = if roll > 15 { "hit" } else if roll > 5 { "graze" } else { "miss" }
    let size = switch roll {
    case 1: "tiny"
    case 20: "huge"
    default: "medium"
    }
    return outcome + size
}

// MARK: - enumSwitchSelf
indirect enum Loot {
    case coins(Int)
    case chest([Loot])
    case nothing

    var worth: Int {
        switch self {
        case .coins(let amount):
            return amount
        case let .chest(contents):
            return contents.reduce(0) { $0 + $1.worth }
        case .nothing:
            return 0
        }
    }
}

// MARK: - nestedFunctions
func nestedFunctions(_ rolls: [Int]) -> Int {
    func double(_ value: Int) -> Int {
        return value * 2
    }
    func clamp(_ value: Int) -> Int {
        func limit() -> Int {
            return 20
        }
        return value > limit() ? limit() : value
    }
    return clamp(double(rolls.first ?? 0))
}

// MARK: - expressionBodies
func expressionBody(_ roll: Int) -> Bool { roll > 10 && roll < 20 }

let criticalCheck: (Int) -> Bool = { $0 == 20 }

// MARK: - backtickIdentifiers
func `default`(`in` lair: String) -> String {
    let `class` = "armor class"
    return `class` + lair
}

// MARK: - commentMarkersInStrings
func commentMarkersInStrings() -> String {
    let url = "https://cellar.example/lair" // trailing comment after a string with slashes
    let block = "/* not a comment */"
    let scroll = """
        The dungeon map // is not a comment
        /* neither is this */
        # nor this
        """
    let raw = #"A "quoted" hoard \(untouched) // still text"#
    return url + block + scroll + raw
}

// MARK: - nestedComment
/* outer comment start
   /* nested comment inside */
   still inside the outer comment: if true { return } */
func nestedComment() -> Int {
    return 1 /* inline block */ + 1
}

// MARK: - docComments
/// Triple slash doc comment for the stable.
/// - Parameter centaur: the centaur to shelter
/// - Returns: the stall number
/**
 Block doc comment with a code sample:
 `if centaur.isTired { rest() }`
 */
// TODO: count the stalls
// swiftlint:disable:next identifier_name
func docComments(_ centaur: Centaur) -> Int {
    return 7
}

// MARK: - dependencyForms
extension Centaur: Wanderer {
    var steps: Int { XPValue }
}

struct DependencyForms {
    typealias Herd = [Centaur]

    let keyPath = \Creature.hitPoints
    let registry: [CreatureId: any Creatures] = [:]

    func opaque(_ creature: Creature) -> some Fightable {
        return creature
    }

    func metatype() -> Creature.Type {
        return Centaur.self
    }

    func typeCheck(_ creature: Creature) -> Bool {
        return creature is Centaur
    }

    func composition(_ fighter: Fightable & Wanderer) -> DTO.Creature? {
        return nil
    }

    func staticCall() -> HitPoints {
        return HitPoints.full(CreatureType.dragon == .dragon ? 3 : 1)
    }
}
