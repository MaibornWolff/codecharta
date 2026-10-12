#pragma once

#include <ostream>
#include <stdexcept>
#include <vector>

namespace de::sots::cellarsandcentaurs::domain::service {

/// Tally of one encounter, written as a triple slash doc comment.
//! The same remark as a Qt style line doc comment.
/*! And once more as a Qt style block doc comment. */
class EncounterTally {
public:
    // case: constructor with initializer list holding a ternary | functions 1, parameters 2, complexity 2
    EncounterTally(int hits, int misses) : hits_{hits}, misses_{misses > 0 ? misses : 0} {}

    // case: constructor as function try block | functions 1, parameters 1, complexity 2
    explicit EncounterTally(const std::vector<int>& rolls) try : hits_{rolls.at(0)}, misses_{0} {
    } catch (const std::out_of_range&) {
        throw;
    }

    // case: defaulted and deleted members | functions 0, complexity 0
    EncounterTally(const EncounterTally&) = default;
    EncounterTally& operator=(const EncounterTally&) = delete;

    // case: destructor | functions 1, parameters 0, complexity 2
    ~EncounterTally() {
        if (hits_ < 0) {
            hits_ = 0;
        }
    }

    // case: in-class inline method | functions 1, parameters 0, complexity 1
    int hits() const noexcept { return hits_; }

    // case: member declarations defined in the source file | functions 0, complexity 0
    int misses() const noexcept;
    static EncounterTally empty();

    // case: compound assignment operator | functions 1, parameters 1, complexity 1
    EncounterTally& operator+=(const EncounterTally& other) {
        hits_ += other.hits_;
        misses_ += other.misses_;
        return *this;
    }

    // case: comparison operator with && | functions 1, parameters 1, complexity 2
    bool operator==(const EncounterTally& other) const { return hits_ == other.hits_ && misses_ == other.misses_; }

    // case: conversion operator with || | functions 1, parameters 0, complexity 2
    explicit operator bool() const { return hits_ > 0 || misses_ > 0; }

    // case: call operator | functions 1, parameters 1, complexity 1
    int operator()(int bonus) const { return hits_ + bonus; }

    // case: friend stream operator defined in the class | functions 1, parameters 2, complexity 1
    friend std::ostream& operator<<(std::ostream& stream, const EncounterTally& tally) { return stream << tally.hits_; }

    // case: data members | functions 0, complexity 0
private:
    int hits_;
    int misses_;
};

// case: class template with one inline member and one declaration | functions 1, parameters 1, complexity 1
template <typename Combatant>
class Pool {
public:
    void add(const Combatant& combatant) { combatants_.push_back(combatant); }
    int size() const;

private:
    std::vector<Combatant> combatants_;
};

// case: out-of-line member of a class template | functions 1, parameters 0, complexity 1
template <typename Combatant>
int Pool<Combatant>::size() const {
    return static_cast<int>(combatants_.size());
}

// case: pure virtual member and defaulted virtual destructor | functions 0, complexity 0
struct Scorable {
    virtual ~Scorable() = default;
    virtual int score() const = 0;
};

}
