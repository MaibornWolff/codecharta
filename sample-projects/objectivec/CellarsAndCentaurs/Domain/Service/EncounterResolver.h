#import <Foundation/Foundation.h>

@class Creature;
@class Dice;

NS_ASSUME_NONNULL_BEGIN

@interface EncounterResolver : NSObject

- (NSString *)resolve:(nullable Creature *)attacker
             defender:(nullable Creature *)defender
                 roll:(NSInteger)roll
                bonus:(NSInteger)bonus
              terrain:(NSInteger)terrain;
- (NSString *)describe:(Creature *)creature;
- (NSInteger)safeRoll:(Dice *)dice;
- (NSArray<Creature *> *)initiativeOrder:(NSArray<Creature *> *)creatures;
- (BOOL)isEmpty;

@end

NS_ASSUME_NONNULL_END
