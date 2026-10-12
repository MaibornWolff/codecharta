package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.ArmorClass
import de.sots.cellarsandcentaurs.domain.model.Centaur
import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.CreatureId
import de.sots.cellarsandcentaurs.domain.model.DiceRoll
import de.sots.cellarsandcentaurs.domain.model.Fightable
import de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException
import de.sots.cellarsandcentaurs.domain.model.Roams
import de.sots.cellarsandcentaurs.domain.model.Speed
import de.sots.cellarsandcentaurs.domain.model.SpeedType
import de.sots.cellarsandcentaurs.domain.model.Zentaurenhöhle

/**
 * Constructs a parser is likely to miscount, one function per construct.
 *
 * @property seed the seed of the encounter
 * @constructor creates the edge cases for one encounter
 */
class EncounterEdgeCases(private val seed: Int, val label: String = "edge") {

    /** propertyAccessors: one conditional in the getter, one if in the setter */
    var morale: Int = 0
        get() = if (field < 0) 0 else field
        set(value) {
            if (value > MAX_MORALE) field = MAX_MORALE else field = value
        }

    /** initBlock: one if */
    init {
        if (seed < 0) println("negative seed")
    }

    /** secondaryConstructor: three parameters, one if */
    constructor(seed: Int, label: String, höhle: Zentaurenhöhle) : this(seed, label) {
        if (höhle.bewohner.isEmpty()) println("empty")
    }

    /** whenWithSubject: three branches and else */
    fun whenWithSubject(roll: Int): String {
        return when (roll) {
            1 -> "miss"
            20 -> "critical"
            10 -> "even"
            else -> "hit"
        }
    }

    /** whenMultipleConditions: one branch with three conditions, and else */
    fun whenMultipleConditions(roll: Int): String {
        return when (roll) {
            1, 2, 3 -> "low"
            else -> "other"
        }
    }

    /** whenRanges: in and !in, and else */
    fun whenRanges(roll: Int): String {
        return when (roll) {
            in 1..5 -> "low"
            !in 6..15 -> "high"
            else -> "middle"
        }
    }

    /** whenIs: two type checks and else */
    fun whenIs(candidate: Any): String {
        return when (candidate) {
            is Creature -> "creature"
            is String -> "text"
            else -> "unknown"
        }
    }

    /** whenWithoutSubject: two branches, one of them with &&, and else */
    fun whenWithoutSubject(roll: Int, bonus: Int): String {
        return when {
            roll < 5 -> "low"
            roll < 10 && bonus > 0 -> "boosted"
            else -> "high"
        }
    }

    /** whenExhaustive: five branches over an enum, no else */
    fun whenExhaustive(speedType: SpeedType): Int {
        return when (speedType) {
            SpeedType.WALKING -> 30
            SpeedType.FLYING -> 60
            SpeedType.SWIMMING -> 20
            SpeedType.BURROWING -> 10
            SpeedType.CLIMBING -> 15
        }
    }

    /** ifExpression: if used as a value */
    fun ifExpression(roll: Int): String {
        val verdict = if (roll > 10) "high" else "low"
        return verdict
    }

    /** ifElseIfExpression: if, else if, else as one value */
    fun ifElseIfExpression(roll: Int): String {
        return if (roll > 15) "high" else if (roll > 5) "middle" else "low"
    }

    /** elvisOperator: one elvis */
    fun elvisOperator(name: String?): String {
        return name ?: "nameless"
    }

    /** elvisWithReturn: an elvis that leaves the function */
    fun elvisWithReturn(creature: Creature): Int {
        val armor = creature.armorClass ?: return 0
        return armor.total
    }

    /** safeCall: one safe call */
    fun safeCall(creature: Creature): Int? {
        return creature.armorClass?.total
    }

    /** notNullAssertion: one not-null assertion */
    fun notNullAssertion(creature: Creature): Int {
        return creature.armorClass!!.total
    }

    /** safeCallLet: a safe call with a let lambda */
    fun safeCallLet(creature: Creature) {
        creature.hitPoints?.let { println(it) }
    }

    /** doWhile: one do while loop */
    fun doWhile(roll: Int): Int {
        var remaining = roll
        do {
            remaining -= 1
        } while (remaining > 0)
        return remaining
    }

    /** repeatLambda: repeat is a function taking a lambda, not a loop statement */
    fun repeatLambda(times: Int): Int {
        var total = 0
        repeat(times) { total += 1 }
        return total
    }

    /** forEachLambda: one lambda with the implicit parameter */
    fun forEachLambda(creatures: List<Creature>) {
        creatures.forEach { println(it) }
    }

    /** trailingLambda: one trailing lambda with two named parameters */
    fun trailingLambda(creatures: List<Creature>): Int {
        return creatures.fold(0) { sum, creature -> sum + creature.type.ordinal }
    }

    /** anonymousFunction: fun without a name, assigned to a value */
    fun anonymousFunction(roll: Int): Int {
        val double = fun(value: Int): Int { return value * 2 }
        return double(roll)
    }

    /** scopeFunctionChain: let, also, run, takeIf in one chain, four lambdas */
    fun scopeFunctionChain(creature: Creature): Creature? {
        return creature.let { it }.also { println(it) }.run { this }.takeIf { it.type.ordinal > 0 }
    }

    /** expressionBody: no braces, no return */
    fun expressionBody(roll: Int): Int = roll * 2

    /** defaultParameters: three parameters, two with defaults */
    fun defaultParameters(roll: Int, bonus: Int = 0, terrain: String = "cave"): Int = roll + bonus + terrain.length

    /** varargParameters: one vararg parameter */
    fun varargParameters(vararg rolls: Int): Int = rolls.size

    /** functionTypeParameter: two parameters, one of a function type */
    fun functionTypeParameter(roll: Int, modifier: (Int) -> Int): Int = modifier(roll)

    /** localFunction: a named function inside a function, holding one if */
    fun localFunction(roll: Int): Int {
        fun clamp(value: Int): Int {
            if (value > 20) return 20
            return value
        }
        return clamp(roll)
    }

    /** suspendFunction: suspend modifier */
    suspend fun suspendFunction(roll: Int): Int = roll

    /** operatorFunction: operator overload */
    operator fun plus(other: EncounterEdgeCases): EncounterEdgeCases = EncounterEdgeCases(seed + other.seed)

    /** infixFunction: infix modifier */
    infix fun beats(other: Int): Boolean = seed > other

    /** labelledReturn: a lambda left with return at a label, one if */
    fun labelledReturn(creatures: List<Creature>) {
        creatures.forEach loop@{
            if (it.type.ordinal == 0) return@loop
            println(it)
        }
    }

    /** labelledBreak: two for loops, one if, break at a label */
    fun labelledBreak(rolls: List<List<Int>>): Int {
        var total = 0
        outer@ for (row in rolls) {
            for (roll in row) {
                if (roll == 1) break@outer
                total += roll
            }
        }
        return total
    }

    /** forWithStep: one for loop over a progression */
    fun forWithStep(): Int {
        var total = 0
        for (roll in 20 downTo 1 step 2) {
            total += roll
        }
        return total
    }

    /** tryExpression: try used as a value, one catch */
    fun tryExpression(text: String): Int {
        return try { text.toInt() } catch (failure: NumberFormatException) { 0 }
    }

    /** multipleCatch: two catch clauses */
    fun multipleCatch(text: String): Int {
        try {
            return text.toInt()
        } catch (missing: NoSuchCreatureException) {
            return -1
        } catch (failure: NumberFormatException) {
            return 0
        }
    }

    /** stringTemplate: an if expression inside a string template */
    fun stringTemplate(roll: Int): String {
        return "roll is ${if (roll > 10) "high" else "low"}"
    }

    /** rawString: comment markers inside a raw string */
    fun rawString(): String {
        return """
            // not a comment
            /* not a comment either */
            http://cellar.example/centaur
        """
    }

    /** commentMarkersInStrings: markers in a string and a char, one real trailing comment */
    fun commentMarkersInStrings(): String {
        val address = "http://dungeon.example" // the real comment
        val block = "/* no comment */"
        val slash = '/'
        return address + block + slash
    }

    /** infixBooleanFunctions: and / or are functions, not operators */
    fun infixBooleanFunctions(hit: Boolean, critical: Boolean): Boolean = (hit and critical) or hit

    /** booleanOperators: one && and one || */
    fun booleanOperators(hit: Boolean, critical: Boolean, blocked: Boolean): Boolean = hit && critical || !blocked

    /** castOnly: Centaur appears only in a safe cast */
    fun castOnly(candidate: Any): Boolean = (candidate as? Centaur) != null

    /** callTypeArgument: CreatureId appears only as the type argument of a call */
    fun callTypeArgument(): Int = emptyList<CreatureId>().size

    /** localVariableType: Speed appears only as the declared type of a local value */
    fun localVariableType(): Boolean {
        val pace: Speed? = null
        return pace == null
    }

    /** lambdaParameterType: DiceRoll appears only as the type of a lambda parameter */
    fun lambdaParameterType(): Int {
        val reader = { roll: DiceRoll -> roll.d20Roll }
        return reader.hashCode()
    }

    /** genericReturnType: ArmorClass appears only as a type argument of the return type */
    fun genericReturnType(): List<ArmorClass> = emptyList()

    /** genericBound: Fightable appears only in a where clause */
    fun <T> strongest(candidates: List<T>): T? where T : Fightable = candidates.firstOrNull()

    /** annotatedFunction: Roams appears only as an annotation on a function */
    @Roams
    fun annotatedFunction(): Int = seed

    /** deprecatedFunction: an annotation with a string argument */
    @Deprecated("Use the encounter resolver instead")
    fun deprecatedFunction(): Int = seed

    /** objectExpression: an anonymous object with one method */
    fun objectExpression(): Comparator<Creature> {
        return object : Comparator<Creature> {
            override fun compare(first: Creature, second: Creature): Int = first.type.ordinal - second.type.ordinal
        }
    }

    /** inlineReified: inline with a reified type parameter, one lambda */
    inline fun <reified T> countOf(items: List<Any>): Int = items.count { it is T }

    /** tailRecursion: tailrec with one if expression */
    tailrec fun countdown(roll: Int): Int = if (roll <= 0) 0 else countdown(roll - 1)

    /** backtickedName: a function name with spaces */
    fun `should roll initiative for every centaur`(): Int = seed

    /**
     * kDocTags: a KDoc block with tags.
     *
     * @param roll the d20 roll
     * @return the roll, unchanged
     */
    fun kDocTags(roll: Int): Int = roll

    /** nestedComment: a block comment inside a block comment */
    fun nestedComment(): Int {
        /* outer comment starts
           /* inner comment */
           still inside the outer comment
         */
        return seed
    }

    /** companionFunction: a function in the companion object */
    companion object {
        const val MAX_MORALE = 10

        @JvmStatic
        fun create(): EncounterEdgeCases = EncounterEdgeCases(0)
    }

    /** interfaceFunctions: one function without a body, one with a default body */
    interface Resolvable {
        fun resolveAll(creatures: List<Creature>): Int

        fun describeAll(): String = "none"
    }
}

/** extensionFunction: the receiver is not a parameter */
fun Creature.isBloodied(): Boolean = hitPoints != null

/** extensionProperty: a getter with one && */
val Creature.isFlying: Boolean
    get() = speeds.containsKey(SpeedType.FLYING) && armorClass != null

/** whenGuard: a guard condition on a when branch (Kotlin 2.1) */
fun whenGuard(candidate: Any, roll: Int): String = when (candidate) {
    is Creature if roll > 10 -> "strong creature"
    is Creature -> "creature"
    else -> "unknown"
}
