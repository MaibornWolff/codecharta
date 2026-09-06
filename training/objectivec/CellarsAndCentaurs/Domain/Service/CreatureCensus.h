@import Foundation;

@protocol Creatures;

NS_ASSUME_NONNULL_BEGIN

@interface CreatureCensus : NSObject

- (instancetype)initWithCreatures:(id<Creatures>)creatures NS_DESIGNATED_INITIALIZER;
- (NSUInteger)headcount;

@end

NS_ASSUME_NONNULL_END
