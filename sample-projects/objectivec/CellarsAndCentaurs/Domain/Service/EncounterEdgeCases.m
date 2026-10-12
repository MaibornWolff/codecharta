#import "EncounterEdgeCases.h"
#import "../Model/Creature.h"
#import <CellarsAndCentaurs/Speed.h>
#include "Dice.h"
#import "CreatureErrors.h"
@import Foundation;

#if __has_include("CreatureLimits.h")
#import "CreatureLimits.h"
#endif

#pragma mark - macroWithTernary
#define CLAMP_ROLL(roll) ((roll) > 20 ? 20 : (roll))

#pragma mark - macroWithLogicalOr
#define IS_DECISIVE(roll) ((roll) == 20 || (roll) == 1)

#pragma mark - multiLineMacro
#define LOG_ENCOUNTER(name) \
    do { \
        if ((name) != nil) { \
            NSLog(@"encounter %@", (name)); \
        } \
    } while (0)

#pragma mark - stringConstants
static NSString *const EncounterLairName = @"minotaur-lair";
NSString *const EncounterDidResolveNotification = @"EncounterDidResolveNotification";

#pragma mark - cFunctionVoid
NSInteger encounterCount(void) {
    return 0;
}

#pragma mark - cFunctionWithLogic
static NSInteger clampRoll(NSInteger roll, NSInteger low, NSInteger high) {
    if (roll < low) {
        return low;
    }
    if (roll > high) {
        return high;
    }
    return roll;
}

#pragma mark - cFunctionPointerParameter
static NSInteger applyModifier(NSInteger roll, NSInteger (*modifier)(NSInteger)) {
    return modifier(roll);
}

#pragma mark - cVariadicFunction
static NSInteger sumOfRolls(NSInteger count, ...) {
    va_list rolls;
    va_start(rolls, count);
    NSInteger total = 0;
    for (NSInteger index = 0; index < count; index++) {
        total += va_arg(rolls, NSInteger);
    }
    va_end(rolls);
    return total;
}

#pragma mark - preprocessorBranches
#if DEBUG
static NSInteger ambushBonus(NSInteger roll) {
    if (roll > 10) {
        return 2;
    }
    return 0;
}
#else
static NSInteger ambushBonus(NSInteger roll) {
    if (roll > 15) {
        return 1;
    }
    return 0;
}
#endif

#pragma mark - structAndTypedef
typedef struct {
    NSInteger gridColumn;
    NSInteger gridRow;
} DungeonTile;

#pragma mark - classExtension
@interface EncounterEdgeCases () {
    NSInteger _ragePoints;
}

@property (nonatomic, strong) NSMutableArray<Creature *> *ambushers;

@end

#pragma mark - categoryOnFoundationType
@interface NSString (Dungeon)

- (BOOL)isDungeonName;

@end

@implementation NSString (Dungeon)

- (BOOL)isDungeonName {
    return [self hasPrefix:@"dungeon"] || [self hasSuffix:@"cellar"];
}

@end

#pragma mark - synthesizeAndDynamic
@implementation EncounterEdgeCases

@synthesize bonus = _bonus;
@dynamic lairDepth;

#pragma mark - classMethod
+ (instancetype)edgeCasesWithBonus:(NSInteger)bonus {
    EncounterEdgeCases *edgeCases = [[self alloc] init];
    edgeCases.bonus = bonus;
    return edgeCases;
}

#pragma mark - classPropertyGetter
+ (NSInteger)defaultBonus {
    return 2;
}

#pragma mark - initializer
- (instancetype)init {
    self = [super init];
    if (self) {
        _ragePoints = 0;
        _ambushers = [NSMutableArray array];
    }
    return self;
}

#pragma mark - dealloc
- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - customGetter
- (NSInteger)bonus {
    return _bonus > 0 ? _bonus : 0;
}

#pragma mark - customSetter
- (void)setBonus:(NSInteger)bonus {
    if (bonus != _bonus) {
        _bonus = bonus;
    }
}

#pragma mark - fastEnumeration
- (NSInteger)fastEnumeration:(NSArray<Creature *> *)creatures {
    NSInteger total = 0;
    for (Creature *creature in creatures) {
        total += [creature rollInitiative];
    }
    return total;
}

#pragma mark - classicForLoop
- (NSInteger)classicForLoop:(NSInteger)count {
    NSInteger total = 0;
    for (NSInteger index = 0; index < count; index++) {
        total += index;
    }
    return total;
}

#pragma mark - doWhile
- (NSInteger)doWhile:(NSInteger)roll {
    do {
        roll -= 1;
    } while (roll > 20);
    return roll;
}

#pragma mark - switchFallthrough
- (NSInteger)switchFallthrough:(NSInteger)terrain {
    NSInteger penalty = 0;
    switch (terrain) {
        case 1:
        case 2:
            penalty = 2;
        case 3:
            penalty += 1;
            break;
        default:
            break;
    }
    return penalty;
}

#pragma mark - switchCaseRange
- (NSInteger)switchCaseRange:(NSInteger)roll {
    switch (roll) {
        case 1 ... 5:
            return 0;
        case 20:
            return 2;
        default:
            return 1;
    }
}

#pragma mark - tryWithSeveralCatches
- (NSInteger)tryWithSeveralCatches:(Dice *)dice {
    @try {
        return dice.roll.result;
    } @catch (NoSuchCreatureException *missing) {
        return -1;
    } @catch (NSException *exception) {
        return -2;
    } @catch (id thrown) {
        return -3;
    } @finally {
        _ragePoints += 1;
    }
}

#pragma mark - blockWithLogic
- (NSInteger)blockWithLogic:(NSInteger)roll {
    NSInteger (^critical)(NSInteger) = ^NSInteger(NSInteger value) {
        if (value == 20 && roll > 0) {
            return value * 2;
        }
        return value;
    };
    return critical(roll);
}

#pragma mark - blockAsArgument
- (NSInteger)blockAsArgument:(NSArray<Creature *> *)creatures {
    __block NSInteger wounded = 0;
    [creatures enumerateObjectsUsingBlock:^(Creature *creature, NSUInteger index, BOOL *stop) {
        if (creature.hitPoints == nil) {
            wounded += 1;
        }
    }];
    return wounded;
}

#pragma mark - blockTypedParameter
- (void)eachAmbusher:(void (^)(Creature *creature, NSUInteger index))visitor {
    visitor(self.ambushers.firstObject, 0);
}

#pragma mark - dispatchAsync
- (void)dispatchAsync:(void (^)(NSInteger roll))completion {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (completion != nil) {
            completion(rollD20());
        }
    });
}

#pragma mark - nestedMessageSends
- (NSString *)nestedMessageSends:(Creature *)creature {
    return [[[[creature description] lowercaseString] capitalizedString] uppercaseString];
}

#pragma mark - dotSyntaxChain
- (NSUInteger)dotSyntaxChain:(Creature *)creature {
    return creature.creatureId.description.lowercaseString.capitalizedString.length;
}

#pragma mark - mixedChain
- (NSUInteger)mixedChain:(Creature *)creature {
    return [[creature.creatureId.description lowercaseString] uppercaseString].length;
}

#pragma mark - multiPartSelector
- (NSInteger)ambush:(Creature *)attacker
           defender:(Creature *)defender
               roll:(NSInteger)roll
              bonus:(NSInteger)bonus
            terrain:(NSInteger)terrain
           surprise:(BOOL)surprise {
    return surprise ? roll + bonus + ambushBonus(roll) : roll - terrain;
}

#pragma mark - variadicMethod
- (NSInteger)totalOfRolls:(NSInteger)first, ... {
    va_list rolls;
    va_start(rolls, first);
    NSInteger total = first;
    NSInteger next;
    while ((next = va_arg(rolls, NSInteger)) != 0) {
        total += next;
    }
    va_end(rolls);
    return total + sumOfRolls(1, first);
}

#pragma mark - synchronizedBlock
- (void)synchronizedBlock:(Creature *)creature {
    @synchronized (self) {
        [self.ambushers addObject:creature];
    }
}

#pragma mark - autoreleasePool
- (NSString *)autoreleasePool:(Creature *)creature {
    @autoreleasepool {
        return [creature description];
    }
}

#pragma mark - elvisOperator
- (NSString *)elvisOperator:(NSString *)name {
    return name ?: @"nameless";
}

#pragma mark - nestedTernary
- (NSInteger)nestedTernary:(NSInteger)roll {
    return roll > 15 ? 2 : roll > 5 ? 1 : 0;
}

#pragma mark - logicalOperatorsWithoutIf
- (BOOL)logicalOperatorsWithoutIf:(NSInteger)roll bonus:(NSInteger)bonus {
    return (roll > 10 && bonus > 0) || roll == 20;
}

#pragma mark - gotoAndLabel
- (NSInteger)gotoAndLabel:(NSInteger)roll {
    if (roll < 0) {
        goto failed;
    }
    return applyModifier(roll, halveRoll);
failed:
    return 0;
}

#pragma mark - availabilityCheck
- (BOOL)availabilityCheck {
    if (@available(iOS 13.0, *)) {
        return YES;
    }
    return NO;
}

#pragma mark - selectorCheck
- (BOOL)selectorCheck:(id)creature {
    if ([creature respondsToSelector:@selector(rollInitiative)] && creature != nil) {
        return YES;
    }
    return NO;
}

#pragma mark - literalsAndSubscripts
- (NSNumber *)literalsAndSubscripts:(NSInteger)roll {
    NSArray<NSNumber *> *rolls = @[@1, @(roll), @20];
    NSDictionary<NSString *, NSNumber *> *named = @{@"first": rolls[0], @"last": rolls[2]};
    return named[@"first"];
}

#pragma mark - indexedSubscript
- (id)objectAtIndexedSubscript:(NSUInteger)index {
    return self.ambushers[index];
}

#pragma mark - commentMarkersInStrings
- (NSString *)commentMarkersInStrings {
    NSString *address = @"http://cellar.example/dungeon";
    NSString *fake = @"/* not a comment */";
    unichar slash = '/';
    NSString *joined = @"first // part "
                       @"second /* part";
    return [NSString stringWithFormat:@"%@ %@ %C %@", address, fake, slash, joined];
}

#pragma mark - docCommentSyntaxes
/// Triple slash doc comment.
/** Javadoc style doc comment. */
/*! HeaderDoc style doc comment. */
//! Bang line doc comment.
- (void)docCommentSyntaxes {
}

#pragma mark - usesMacros
- (NSInteger)usesMacros:(NSInteger)roll {
    LOG_ENCOUNTER(EncounterLairName);
    return IS_DECISIVE(roll) ? CLAMP_ROLL(roll) : clampRoll(roll, 1, 20);
}

#pragma mark - unicodeIdentifier
- (NSInteger)unicodeIdentifier {
    NSInteger höhlentiefe = 3;
    return höhlentiefe;
}

#pragma mark - localVariablesForDomain
- (NSString *)localVariablesForDomain {
    NSString *minotaurBanner = NSLocalizedString(@"Wandering minotaur", nil);
    DungeonTile portcullisTile = {3, 4};
    return [NSString stringWithFormat:@"%@ at %ld\n", minotaurBanner, (long)portcullisTile.gridColumn];
}

@end

#pragma mark - categoryImplementation
@implementation EncounterEdgeCases (Ambush)

- (BOOL)hasAmbushers {
    return self.ambushers.count > 0;
}

@end
