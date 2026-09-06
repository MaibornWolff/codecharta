#import "CreatureRepository.h"

@compatibility_alias Entity CreatureEntity;

@implementation CreatureRepository

- (void)saveEntity:(Entity *)entity {
    [self save:entity withIdentifier:entity.identifier];
}

@end
