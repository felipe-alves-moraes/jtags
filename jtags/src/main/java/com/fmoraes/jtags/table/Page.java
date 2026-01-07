package com.fmoraes.jtags.table;

import java.util.List;

public record Page<T>(
    List<T> items,
    int currentPage,
    int pageSize,
    long totalItems
) {
    public int totalPages() {
        return (int) Math.ceil((double) totalItems / pageSize);
    }

    public boolean hasPrevious() {
        return currentPage > 1;
    }

    public boolean hasNext() {
        return currentPage < totalPages();
    }

}
