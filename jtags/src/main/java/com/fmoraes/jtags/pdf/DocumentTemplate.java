package com.fmoraes.jtags.pdf;

import java.util.List;

public record DocumentTemplate(
    String id,
    String name,
    String description,
    List<TableArea> areas
) {

}
