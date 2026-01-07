package com.fmoraes.jtags.table;

public record TableState<T>(
    Page<T> page,
    String sortBy,
    boolean ascending,
    String searchTerm,
    String searchField
) {

}
