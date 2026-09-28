package de.sots.cellarsandcentaurs.domain.model;

record XPValue(int amount) {
    static XPValue forChallengeRating(int challengeRating) {
        return new XPValue(challengeRating * 200);
    }
}
