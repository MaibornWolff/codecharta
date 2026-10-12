#import <Foundation/Foundation.h>
#import "EncounterResolver.h"

@class Creature;
@protocol Fightable;

NS_ASSUME_NONNULL_BEGIN

typedef NS_OPTIONS(NSUInteger, EncounterTrait) {
    EncounterTraitNone = 0,
    EncounterTraitAmbush = 1 << 0,
    EncounterTraitMagical = 1 << 1
};

FOUNDATION_EXPORT NSString *const EncounterDidResolveNotification;

NSInteger encounterCount(void);

static inline NSInteger halveRoll(NSInteger roll) {
    if (roll > 1) {
        return roll / 2;
    }
    return roll;
}

@protocol EncounterObserver <NSObject>
@required
- (void)encounterDidResolve:(NSString *)verdict;
@optional
- (void)encounterDidStart;
@end

/// Constructs the parsers are likely to miscount, one method per construct.
@interface EncounterEdgeCases : EncounterResolver

@property (nonatomic, assign) NSInteger bonus;
@property (nonatomic, assign, readonly) NSInteger lairDepth;
@property (nonatomic, assign, getter=isRaging) BOOL raging;
@property (class, nonatomic, readonly) NSInteger defaultBonus;
@property (nonatomic, weak, nullable) id<EncounterObserver> observer;
@property (nonatomic, weak, nullable) id<Fightable> challenger;

+ (instancetype)edgeCasesWithBonus:(NSInteger)bonus;
- (NSInteger)fastEnumeration:(NSArray<Creature *> *)creatures;
- (NSInteger)ambush:(Creature *)attacker
           defender:(Creature *)defender
               roll:(NSInteger)roll
              bonus:(NSInteger)bonus
            terrain:(NSInteger)terrain
           surprise:(BOOL)surprise;
- (NSInteger)totalOfRolls:(NSInteger)first, ... NS_REQUIRES_NIL_TERMINATION;
- (id)objectAtIndexedSubscript:(NSUInteger)index;

@end

@interface EncounterEdgeCases (Ambush)

- (BOOL)hasAmbushers;

@end

NS_ASSUME_NONNULL_END
