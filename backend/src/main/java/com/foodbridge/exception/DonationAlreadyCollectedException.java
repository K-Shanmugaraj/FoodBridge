package com.foodbridge.exception;

public class DonationAlreadyCollectedException extends RuntimeException {

    public DonationAlreadyCollectedException(String message) {
        super(message);
    }
}
