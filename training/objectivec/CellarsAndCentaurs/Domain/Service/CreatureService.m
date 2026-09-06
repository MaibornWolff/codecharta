#import "CreatureService.h"
#import "Creature.h"
#import <CocoaLumberjack/CocoaLumberjack.h>

static const DDLogLevel ddLogLevel = DDLogLevelInfo;

@interface CreatureService ()

@property (nonatomic, strong) id<Creatures> creatures;

@end

@implementation CreatureService

- (instancetype)initWithCreatures:(id<Creatures>)creatures {
    self = [super init];
    if (self) {
        _creatures = creatures;
    }
    return self;
}

- (void)save:(Creature *)creature {
    DDLogInfo(@"Saving creature %@", creature.creatureId);
    [self.creatures save:creature];
}

@end
