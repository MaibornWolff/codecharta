#import "EncounterResolver.h"
#import "Creature.h"
#include <vector>
#include <exception>

namespace cellars {

class RollLedger {
public:
    void record(int roll) {
        rolls.push_back(roll);
    }

    int best() const {
        int highest = 0;
        for (int roll : rolls) {
            if (roll > highest) {
                highest = roll;
            }
        }
        return highest;
    }

private:
    std::vector<int> rolls;
};

template <typename T>
T larger(T left, T right) {
    return left > right ? left : right;
}

} // namespace cellars

// Objective-C++ bridge between the resolver and a C++ roll ledger.
@interface EncounterBridge : EncounterResolver

- (NSInteger)bestRollOf:(NSArray<NSNumber *> *)rolls;

@end

@implementation EncounterBridge

- (NSInteger)bestRollOf:(NSArray<NSNumber *> *)rolls {
    cellars::RollLedger ledger;
    auto keep = [&ledger](int roll) {
        if (roll > 0) {
            ledger.record(roll);
        }
    };
    for (NSNumber *roll in rolls) {
        keep(roll.intValue);
    }
    try {
        return cellars::larger(ledger.best(), 1);
    } catch (const std::exception &error) {
        return 0;
    }
}

@end
