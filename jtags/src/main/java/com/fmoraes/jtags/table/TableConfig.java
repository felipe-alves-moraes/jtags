package com.fmoraes.jtags.table;

import java.util.List;
import java.util.Set;

public record TableConfig(
    String baseUrl,
    List<TableColumn> columns,
    String idField,
    boolean showSearch,
    Set<String> searchableFields,
    boolean showCheckbox,
    List<ToolbarAction> toolbarActions,
    boolean showPaginationLabels,
    String iconBasePath,
    List<Integer> pageSizeOptions
) {

    public TableConfig(String baseUrl, List<TableColumn> columns, String idField, boolean showSearch,
        Set<String> searchableFields, boolean showCheckbox, List<ToolbarAction> toolbarActions) {
        this(baseUrl, columns, idField, showSearch, searchableFields, showCheckbox, toolbarActions, false,
            "/icons/jtags/icons.svg", List.of(5, 25, 50, 100)
        );
    }
}
