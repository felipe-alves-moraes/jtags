package com.fmoraes.domain;

public record User(
    Long id,
    String name,
    String email,
    String role
) {

}
