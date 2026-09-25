#import "CreatureErrors.h"
#import "CreatureId.h"

NSExceptionName const NoSuchCreatureExceptionName = @"NoSuchCreatureException";

@interface NoSuchCreatureException ()

@property (nonatomic, copy, readwrite) CreatureId *missingId;

@end

@implementation NoSuchCreatureException

+ (instancetype)exceptionWithCreatureId:(CreatureId *)creatureId {
    NSString *reason = [@"No such creature in the dungeon: " stringByAppendingString:creatureId.value];
    NoSuchCreatureException *exception = [[self alloc] initWithName:NoSuchCreatureExceptionName reason:reason userInfo:nil];
    exception.missingId = creatureId;
    return exception;
}

@end
