#import "Creature.h"

@implementation Creature

- (NSString *)description {
    return [NSString stringWithFormat:@"%@ (%ld hp) in %@", self.identifier, (long)self.hitPoints, self.stable];
}

@end
