package com.fmoraes.jtags.pdf;

public record TableArea(
    String id,
    String label,
    Integer startPage,        // null = all pages
    Integer endPage,          // null = to end
    Double x,                 // Percentage 0-100
    Double y,
    Double width,
    Double height,
    boolean spansMultiplePages
) {

}
