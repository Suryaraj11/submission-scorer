package com.scorer.model;

public enum ScoreTier {
    EXCEPTIONAL("Exceptional"),
    HIGH_PERFORMER("High Performer"),
    PROMISING("Promising"),
    DEVELOPING("Developing");

    private final String label;

    ScoreTier(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
