#import <Foundation/Foundation.h>

@class CreatureId;

NS_ASSUME_NONNULL_BEGIN

extern NSExceptionName const NoSuchCreatureExceptionName;

@interface NoSuchCreatureException : NSException

@property (nonatomic, copy, readonly) CreatureId *missingId;

+ (instancetype)exceptionWithCreatureId:(CreatureId *)creatureId;

@end

NS_ASSUME_NONNULL_END
