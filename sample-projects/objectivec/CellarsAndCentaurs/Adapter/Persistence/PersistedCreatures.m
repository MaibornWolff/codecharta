#import "PersistedCreatures.h"
#import "CreatureRepository.h"
#import "CreatureEntity.h"
#import "Creature.h"
#import "CreatureId.h"
#import "CreatureErrors.h"
#import "CellarsAndCentaurs.h"

@interface PersistedCreatures ()

@property (nonatomic, strong) CreatureRepository *repository;

@end

@implementation PersistedCreatures

- (instancetype)initWithRepository:(CreatureRepository *)repository {
    self = [super init];
    if (self) {
        _repository = repository;
    }
    return self;
}

- (void)save:(Creature *)creature {
    CreatureEntity *entity = [[CreatureEntity alloc] initWithIdentifier:creature.creatureId.value];
    [self.repository saveEntity:entity];
}

- (Creature *)find:(CreatureId *)creatureId {
    CreatureEntity *entity = [self.repository findOne:creatureId.value];
    if (entity == nil) {
        @throw [NoSuchCreatureException exceptionWithCreatureId:creatureId];
    }
    CreatureId *foundId = [CreatureId creatureIdWithValue:entity.identifier];
    return [[Creature alloc] initWithId:foundId type:CreatureFacade.standardCreatureType];
}

- (NSArray<Creature *> *)findAll {
    NSMutableArray<Creature *> *creatures = [NSMutableArray array];
    for (CreatureEntity *entity in [self.repository findAll]) {
        [creatures addObject:[self find:[CreatureId creatureIdWithValue:entity.identifier]]];
    }
    return [creatures copy];
}

@end
