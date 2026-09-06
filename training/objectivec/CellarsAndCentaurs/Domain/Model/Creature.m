#import "Creature.h"
#import "CreatureId.h"
#import "ArmorClass.h"
#import "HitPoints.h"
#import "Speed.h"
#import "Dice.h"
#import "CellarsAndCentaurs.h"

@interface Creature ()

@property (nonatomic, assign) NSInteger initiative;

@end

@implementation Creature

@synthesize speeds = _speeds;

- (instancetype)initWithId:(CreatureId *)creatureId {
    return [self initWithId:creatureId type:CreatureFacade.standardCreatureType];
}

- (instancetype)initWithId:(CreatureId *)creatureId type:(CreatureType)type {
    self = [super init];
    if (self) {
        _creatureId = [creatureId copy];
        _type = type;
        _speeds = @{};
    }
    return self;
}

- (Speed *)speedOfType:(SpeedType)speedType {
    return self.speeds[@(speedType)];
}

#pragma mark - Fightable

- (NSInteger)rollInitiative {
    self.initiative = rollD20();
    return self.initiative;
}

- (void)takeDamage:(NSInteger)damage {
    [self.hitPoints loseHitPoints:damage];
}

@end
