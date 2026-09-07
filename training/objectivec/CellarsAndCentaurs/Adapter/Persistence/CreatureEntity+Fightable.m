#import "CreatureEntity+Fightable.h"

@implementation CreatureEntity (Fightable)

@dynamic storedHitPoints;

- (NSInteger)rollInitiative {
    return self.typeCode + 1;
}

- (void)takeDamage:(NSInteger)damage {
    self.storedHitPoints = MAX(0, self.storedHitPoints - damage);
}

@end
