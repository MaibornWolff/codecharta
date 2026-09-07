@import Foundation;
#import "CreatureUtil.h"
#import "Fightable.h"

@implementation CreatureUtil

+ (NSString *)standardArmorClassDescription {
    return @"Natural Armor";
}

/*
 * Counts the treasure hoard a creature guards.
 */
+ (NSUInteger)treasureHoardOf:(Creature *)creature {
    return [creature treasureHoardValue];
}

@end

@implementation Creature (Treasure)

- (NSUInteger)treasureHoardValue {
    return (NSUInteger)(self.hitPoints.max * 10);
}

@end
