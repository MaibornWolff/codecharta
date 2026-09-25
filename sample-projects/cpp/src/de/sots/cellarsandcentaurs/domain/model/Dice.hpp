#pragma once

#include <random>

namespace de::sots::cellarsandcentaurs::domain::model {

struct DiceRoll {
    int sides;
    int value;
};

class Dice {
public:
    explicit Dice(int sides) : sides_{sides} {}

    DiceRoll roll() const {
        static std::mt19937 generator{std::random_device{}()};
        std::uniform_int_distribution<int> distribution(1, sides_);
        return DiceRoll{sides_, distribution(generator)};
    }

private:
    int sides_;
};

inline DiceRoll rollD20() {
    Dice twentySided(20);
    DiceRoll d20Roll = twentySided.roll();
    return d20Roll;
}

}
