#import <XCTest/XCTest.h>
#import <OCMock/OCMock.h>
#import "CreatureService.h"
#import "Creature.h"
#import "CreatureId.h"
#import "Speed.h"

@interface CreatureServiceTests : XCTestCase

@property (nonatomic, strong) id creaturesMock;
@property (nonatomic, strong) CreatureService *creatureService;

@end

@implementation CreatureServiceTests

- (void)setUp {
    [super setUp];
    self.creaturesMock = OCMProtocolMock(@protocol(Creatures));
    self.creatureService = [[CreatureService alloc] initWithCreatures:self.creaturesMock];
}

- (void)test_should_save_creature_to_the_stable {
    // Arrange
    Speed *walking_speed = [Speed speedWithFeetPerRound:30];
    Creature *creature = [[Creature alloc] initWithId:[CreatureId creatureIdWithValue:@"centaur-1"]];
    creature.speeds = @{ @(SpeedTypeWalking): walking_speed };

    // Act
    [self.creatureService save:creature];

    // Assert
    OCMVerify([self.creaturesMock save:creature]);
}

@end
