package com.fmoraes.jtags.pdf;

import java.util.List;

public record PdfSelectorConfig(
    String baseUrl,
    String pdfUrl,
    String pdfId,
    String iconBasePath,
    List<DocumentTemplate> templates,
    String selectedTemplateId
) {

    public PdfSelectorConfig(String baseUrl, String pdfUrl, String pdfId) {
        this(baseUrl, pdfUrl, pdfId, "/icons/jtags/icons.svg", List.of(), null);
    }
}
