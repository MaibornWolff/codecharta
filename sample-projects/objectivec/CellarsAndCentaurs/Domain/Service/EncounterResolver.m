#import "EncounterResolver.h"
#import "Creature.h"
#import "Speed.h"
#import "Dice.h"

/**
 * Resolves an encounter between two creatures in the dungeon.
 * The attacker rolls against the armor class of the defender.
 * Terrain and speed decide how much of the roll survives.
 * Initiative order is settled before the first blow.
 */
@implementation EncounterResolver

// Decides the outcome of one attack.
- (NSString *)resolve:(Creature *)attacker
             defender:(Creature *)defender
                 roll:(NSInteger)roll
                bonus:(NSInteger)bonus
              terrain:(NSInteger)terrain {
    if (attacker == nil) {
        return @"none";
    } else if (roll == 1) {
        return @"fumble";
    } else {
        roll += bonus;
    }
    NSInteger reach = 0;
    for (Speed *speed in attacker.speeds.allValues) {
        if (speed.feetPerRound > 0 && speed.feetPerRound < 100) {
            reach += speed.feetPerRound;
        }
    }
    while (reach > 60) {
        reach -= 10;
    }
    /* Terrain one and two hinder the attacker,
       terrain three helps. */
    switch (terrain) {
        case 1:
            roll -= 2;
            break;
        case 2:
            roll -= 4;
            break;
        case 3:
            roll += 1;
            break;
        default:
            break;
    }
    BOOL outOfReach = defender == nil || reach == 0;
    NSString *verdict = roll >= 15 ? @"hit" : @"miss"; // armor class of the defender
    // verdict = [verdict uppercaseString];
    NSLog(@"out of reach: %d", outOfReach);
    return verdict;
}

// Describes a creature in one line.
- (NSString *)describe:(Creature *)creature {
    NSString *name = [[[[[creature description] lowercaseString] capitalizedString] decomposedStringWithCanonicalMapping] uppercaseString];
    NSString *kind = [[[creature class] description] lowercaseString];
    return [name stringByAppendingString:kind];
}

// Rolls without letting an exception escape.
- (NSInteger)safeRoll:(Dice *)dice {
    NSInteger (^clamp)(NSInteger) = ^NSInteger(NSInteger value) {
        if (value > 20) {
            return 20;
        }
        return value;
    };
    @try {
        return clamp(dice.roll.result);
    } @catch (NSException *exception) {
        return 1;
    } @finally {
        NSLog(@"rolled");
    }
}

- (NSArray<Creature *> *)initiativeOrder:(NSArray<Creature *> *)creatures {
    NSComparator byInitiative = ^NSComparisonResult(Creature *left, Creature *right) {
        return [@([right rollInitiative]) compare:@([left rollInitiative])];
    };
    if (creatures.count > 8) {
        NSArray<Creature *> *firstEight = [creatures subarrayWithRange:NSMakeRange(0, 8)];
        return [self initiativeOrder:firstEight];
    }
    return [creatures sortedArrayUsingComparator:byInitiative];
}

- (BOOL)isEmpty {
    return YES;
}

@end
