#import "EntityArchive.h"

@interface EntityArchive ()

@property (nonatomic, strong) NSMutableArray<Entity *> *entities;

@end

@implementation EntityArchive

- (instancetype)init {
    self = [super init];
    if (self) {
        _entities = [NSMutableArray array];
    }
    return self;
}

- (NSArray<Entity *> *)archivedEntities {
    return [self.entities copy];
}

- (void)archiveEntity:(Entity *)entity {
    [self.entities addObject:entity];
}

@end
