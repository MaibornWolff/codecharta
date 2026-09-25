#import <Foundation/Foundation.h>

@class Creature;
@class CreatureId;

NS_ASSUME_NONNULL_BEGIN

@protocol Creatures <NSObject>

- (void)save:(Creature *)creature;
- (Creature *)find:(CreatureId *)creatureId;

@optional
- (NSArray<Creature *> *)findAll;

@end

NS_ASSUME_NONNULL_END
