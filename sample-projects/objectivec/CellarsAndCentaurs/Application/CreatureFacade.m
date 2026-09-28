#import "CreatureFacade.h"
#import "CreatureService.h"
#import "Creature.h"
#import "CreatureId.h"
#import "HitPoints.h"
#import "Speed.h"
#import "SpeedType.h"
#import "ArmorClass.h"
#import "DTO/Creature.h"

static NSString *const CreatureFacadeStableName = @"centaur-stable";

@interface CreatureFacade ()

@property (nonatomic, strong) CreatureService *creatureService;

@end

@implementation CreatureFacade

+ (CreatureType)standardCreatureType {
    return CreatureTypeMonstrosity;
}

- (instancetype)initWithCreatureService:(CreatureService *)creatureService {
    self = [super init];
    if (self) {
        _creatureService = creatureService;
    }
    return self;
}

- (Creature *)createWithType:(CreatureType)type
                walkingSpeed:(Speed *)walkingSpeed
                 flyingSpeed:(Speed *)flyingSpeed
               swimmingSpeed:(Speed *)swimmingSpeed
              burrowingSpeed:(Speed *)burrowingSpeed
               climbingSpeed:(Speed *)climbingSpeed
                  armorClass:(ArmorClass *)armorClass
                   hitPoints:(NSInteger)hitPointsValue {
    // Rolls initiative for every creature in the dungeon before the encounter starts.
    CreatureId *creatureId = [CreatureId creatureIdWithValue:[NSUUID UUID].UUIDString];
    Creature *creature = [[Creature alloc] initWithId:creatureId type:type];
    creature.armorClass = armorClass;
    creature.hitPoints = [HitPoints hitPointsWithMax:hitPointsValue];
    creature.speeds = @{
        @(SpeedTypeWalking): walkingSpeed,
        @(SpeedTypeFlying): flyingSpeed,
        @(SpeedTypeSwimming): swimmingSpeed,
        @(SpeedTypeBurrowing): burrowingSpeed,
        @(SpeedTypeClimbing): climbingSpeed
    };
    [creature rollInitiative];
    [self.creatureService save:creature];
    NSLog(@"Stabled %@ in %@", creatureId.value, CreatureFacadeStableName);
    return creature;
}

- (CreatureDTO *)toDTO:(Creature *)creature {
    CreatureDTO *dto = [[CreatureDTO alloc] init];
    dto.identifier = creature.creatureId.value;
    dto.hitPoints = creature.hitPoints.current;
    dto.stable = CreatureFacadeStableName;
    return dto;
}

@end
