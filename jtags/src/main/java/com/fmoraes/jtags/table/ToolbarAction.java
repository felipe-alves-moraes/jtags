package com.fmoraes.jtags.table;

public record ToolbarAction(
    String key,
    String label,
    String icon,
    String url,
    String method,
    boolean confirm,
    String confirmMessage,
    boolean selectionBased,
    boolean showLabel
) {

    public ToolbarAction(String key, String label, String icon, String url, String method, boolean confirm,
        String confirmMessage, boolean selectionBased) {
        this(key, label, icon, url, method, confirm, confirmMessage, selectionBased, false);
    }
}
