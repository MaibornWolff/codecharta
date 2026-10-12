//go:generate stringer -type=SpeedType

package service

import (
	"errors"
	"fmt"
	"strings"

	"de.sots/cellarsandcentaurs/domain/model"
)

var fallbackTerrain = "cellar"

var fallbackArmor model.ArmorClass

var rollTwice = func(sides int) int { return sides * 2 }

type damageRule func(damage int) int

type edgeCaseRoller interface {
	rollOnce(sides int) int
	rollTwice(sides, bonus int) (int, int)
}

type edgeCaseNumber interface {
	~int | ~float64
}

type edgeCaseTally struct {
	hits int
}

type edgeCasePair[K comparable, V any] struct {
	key   K
	value V
}

func init() {
	fallbackTerrain = "dungeon"
}

func init() {
	fallbackTerrain = strings.ToLower(fallbackTerrain)
}

func forClassic(limit int) int {
	total := 0
	for index := 0; index < limit; index++ {
		total += index
	}
	return total
}

func forCondition(damage int) int {
	for damage > 10 {
		damage -= 3
	}
	return damage
}

func forInfinite(rolls []int) int {
	index := 0
	for {
		if index >= len(rolls) {
			break
		}
		index++
	}
	return index
}

func forRange(bonuses []int) int {
	total := 0
	for _, bonus := range bonuses {
		total += bonus
	}
	return total
}

func forRangeInteger() int {
	total := 0
	for range 3 {
		total++
	}
	return total
}

func forRangeChannel(rolls chan int) int {
	total := 0
	for roll := range rolls {
		total += roll
	}
	return total
}

func switchWithoutTag(damage int) string {
	switch {
	case damage > 20:
		return "deadly"
	case damage > 10:
		return "severe"
	default:
		return "light"
	}
}

func typeSwitch(value any) string {
	switch typed := value.(type) {
	case int:
		return fmt.Sprint(typed)
	case string:
		return typed
	case nil:
		return "nothing"
	default:
		return "unknown"
	}
}

func switchFallthrough(level int) int {
	bonus := 0
	switch level {
	case 3:
		bonus++
		fallthrough
	case 2:
		bonus++
		fallthrough
	case 1, 0:
		bonus++
	}
	return bonus
}

func selectCases(rolls chan int, done chan bool) int {
	select {
	case roll := <-rolls:
		return roll
	case <-done:
		return -1
	default:
		return 0
	}
}

func ifWithInit(dice string) int {
	sides := 0
	if _, err := fmt.Sscan(dice, &sides); err != nil {
		return 20
	}
	return sides
}

func deferRecover() (failed bool) {
	defer func() {
		if recover() != nil {
			failed = true
		}
	}()
	panic("the dice fell off the table")
}

func goroutine(rolls chan int) {
	go func() {
		rolls <- 20
	}()
	go fmt.Println("rolled")
}

func closureCounter() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

func nestedClosures(limit int) func() func() bool {
	return func() func() bool {
		return func() bool {
			return limit > 0 && limit < 20
		}
	}
}

func immediatelyInvoked(roll int) int {
	return func(value int) int {
		if value < 1 {
			return 1
		}
		return value
	}(roll)
}

func (t *edgeCaseTally) pointerReceiver(hits int) {
	t.hits += hits
}

func (t edgeCaseTally) valueReceiver() int {
	return t.hits
}

func (edgeCaseTally) unnamedReceiver() {}

func (p edgeCasePair[K, V]) genericReceiver() K {
	return p.key
}

func variadic(bonuses ...int) int {
	total := 0
	for _, bonus := range bonuses {
		total += bonus
	}
	return total
}

func groupedParameters(strength, dexterity int, name, title string) string {
	return fmt.Sprint(name, title, strength, dexterity)
}

func groupedLongParameterList(strength, dexterity, constitution, wisdom, charisma int) int {
	return strength + dexterity + constitution + wisdom + charisma
}

func blankParameters(_ int, _ string) {}

func callbackParameter(apply func(int, string) error, fallback damageRule) error {
	return apply(fallback(1), "hit")
}

func channelDirections(in <-chan int, out chan<- int) {
	out <- <-in
}

func multipleReturns(roll int) (int, error) {
	if roll < 1 {
		return 0, errors.New("no roll")
	}
	return roll, nil
}

func namedReturns(damage, armor int) (remaining, absorbed int, err error) {
	absorbed = armor
	remaining = damage - armor
	return
}

func genericMax[T edgeCaseNumber](left, right T) T {
	if left > right {
		return left
	}
	return right
}

func labelledBreak(grid [][]int) int {
	found := 0
outer:
	for _, row := range grid {
		for _, cell := range row {
			if cell < 0 {
				continue outer
			}
			if cell > 99 {
				break outer
			}
			found++
		}
	}
	return found
}

func gotoRetry(attempts int) int {
retry:
	if attempts > 0 {
		attempts--
		goto retry
	}
	return attempts
}

func rawStringWithCommentMarkers() string {
	return `the lair map
// this line is text, not a comment
/* neither is this */ if x && y || z
for case select`
}

func stringWithCommentMarkers() string {
	return "http://cellar.example/lair" + "/* open */ a && b || c" + string('/')
}

func logicalOperators(hit, critical, blocked bool) bool {
	return hit && !blocked || critical
}

func bitwiseAndChannelOperators(flags int, rolls chan int) int {
	rolls <- flags & 3
	return flags | 4&^1
}

func oneLiner() int { return 20 }

//go:noinline
func directiveNoinline() int {
	return 20
}

// docLineComment guards the vault.
func docLineComment() {}

/* docBlockComment lowers the portcullis. */
func docBlockComment() {}

/**
 * docJavadocComment wakes the gargoyle.
 */
func docJavadocComment() {}

func methodExpression(resolver *EncounterResolver) bool {
	isEmpty := (*EncounterResolver).IsEmpty
	return isEmpty(resolver)
}

func dependencySamePackageCall() int {
	return RerollInitiative(nil)
}

func dependencyConstOnly() int {
	return model.MAX_HIT_POINTS
}

func dependencyEnumConstOnly() int {
	return int(model.Flying)
}

func dependencyGenericConstraint[F model.Fightable](fighter F) {
	fighter.TakeDamage(1)
}

func dependencyChannelElement(rolls chan model.DiceRoll) int {
	return len(rolls)
}

func dependencyLocalVariableType() int {
	var seen map[model.CreatureId]int
	return len(seen)
}

func dependencyLiteralInGoroutine(feet chan int) {
	go func() {
		feet <- model.Speed{Feet: 30}.Feet
	}()
}

func dependencyErrorsAs(err error) bool {
	var missing *model.NoSuchCreatureException
	return errors.As(err, &missing)
}

func dependencyTypeAssertion(value any) bool {
	_, ok := value.(model.CreatureType)
	return ok
}

func dependencyLocalEmbedding() int {
	type mount struct {
		*model.Creature
		saddle int
	}
	return mount{}.saddle
}

func dependencyTypeSwitchPointer(value any) bool {
	switch value.(type) {
	case *model.Centaur:
		return true
	}
	return false
}
