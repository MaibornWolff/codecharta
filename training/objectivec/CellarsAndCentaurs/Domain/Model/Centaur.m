#import "Centaur.h"
#import "CreatureId.h"
#import "Speed.h"

static const NSUInteger CentaurChargeThreshold = 30;

@implementation Centaur

- (instancetype)initWithId:(CreatureId *)creatureId type:(CreatureType)type {
    return [super initWithId:creatureId type:CreatureTypeMonstrosity];
}

- (NSUInteger)XPValue {
    return 450;
}

- (BOOL)canCharge {
    Speed *walkingSpeed = [self speedOfType:SpeedTypeWalking];
    return walkingSpeed.feetPerRound >= CentaurChargeThreshold;
}

- (NSInteger)rollInitiative {
    return [super rollInitiative] + 2;
}

@end
