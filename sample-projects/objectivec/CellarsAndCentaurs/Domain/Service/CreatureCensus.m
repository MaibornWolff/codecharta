#import "CreatureCensus.h"
#import "Creatures.h"

@interface CreatureCensus ()

@property (nonatomic, strong) id<Creatures> creatures;

@end

@implementation CreatureCensus

- (instancetype)initWithCreatures:(id<Creatures>)creatures {
    self = [super init];
    if (self) {
        _creatures = creatures;
    }
    return self;
}

- (NSUInteger)headcount {
    return [self.creatures findAll].count;
}

@end
