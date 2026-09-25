#import <Foundation/Foundation.h>
#import "Creatures.h"

@class Creature;

NS_ASSUME_NONNULL_BEGIN

@interface CreatureService : NSObject

- (instancetype)initWithCreatures:(id<Creatures>)creatures NS_DESIGNATED_INITIALIZER;
- (void)save:(Creature *)creature;

@end

NS_ASSUME_NONNULL_END
