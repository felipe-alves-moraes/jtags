package com.fmoraes.ui;

import com.fmoraes.jtags.pdf.PdfSelectorConfig;
import io.quarkus.qute.Location;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.awt.geom.Rectangle2D;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.PDFTextStripperByArea;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Path("/pdf")
public class PdfDemoResource {

    @Inject
    Template pdfDemo;

    @Location("fragments/pdf-selector-fragment.html")
    Template pdfSelectorFragment;
    @Location("fragments/extraction-result.html")
    Template extractionResult;

    @Location("fragments/extraction-error.html")
    Template extractionError;

    // Temp storage (replace with MinIO later)
    private static final java.nio.file.Path UPLOAD_DIR = java.nio.file.Path.of(System.getProperty("java.io.tmpdir"),
        "jtags-pdf");

    static {
        try {
            Files.createDirectories(UPLOAD_DIR);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance page() {
        return pdfDemo.instance();
    }

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance upload(@RestForm("file") FileUpload file) throws IOException {
        String pdfId = UUID.randomUUID().toString();
        String fileName = pdfId + ".pdf";

        final var destination = UPLOAD_DIR.resolve(fileName);
        Files.copy(file.uploadedFile(), destination, StandardCopyOption.REPLACE_EXISTING);

        var config = new PdfSelectorConfig(
            "/pdf",
            "/pdf/files/" + fileName,
            pdfId
        );

        return pdfSelectorFragment.data("config", config);
    }

    @GET
    @Path("/files/{fileName}")
    @Produces("application/pdf")
    public byte[] serveFile(@PathParam("fileName") String fileName) throws IOException {
        final var filePath = UPLOAD_DIR.resolve(fileName);
        return Files.readAllBytes(filePath);
    }

    @POST
    @Path("/extract")
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance extract(
        @FormParam("pdfId") String pdfId,
        @FormParam("page") Integer page,
        @FormParam("x") Double x,
        @FormParam("y") Double y,
        @FormParam("width") Double width,
        @FormParam("height") Double height) {

        try {
            final var pdfPath = UPLOAD_DIR.resolve(pdfId + ".pdf");
            final var extractedText = extractText(pdfPath, page, x, y, width, height);

            return extractionResult.data("text", extractedText);

        } catch (Exception e) {
            return extractionError.data("message", e.getMessage());
        }
    }

    private String extractText(java.nio.file.Path pdfPath, Integer page, Double x, Double y, Double width, Double height) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {

            // No selection - extract full document
            if (page == null || x == null) {
                var stripper = new PDFTextStripper();
                return stripper.getText(document);
            }

            // Has selection - extract specific region
            return extractRegion(document, page, x, y, width, height);
        }
    }

    private String extractRegion(PDDocument document, int page, double x, double y, double width, double height) throws IOException {
        var stripper = new PDFTextStripperByArea();
        stripper.setSortByPosition(true);

        // Get page dimensions
        var pdfPage = document.getPage(page - 1);  // 0-indexed
        var mediaBox = pdfPage.getMediaBox();
        float pageWidth = mediaBox.getWidth();
        float pageHeight = mediaBox.getHeight();

        // Convert percentages to PDF points
        float rectX = (float) (x / 100.0 * pageWidth);
        float rectY = (float) (y / 100.0 * pageHeight);
        float rectW = (float) (width / 100.0 * pageWidth);
        float rectH = (float) (height / 100.0 * pageHeight);

        // Define extraction region
        var rect = new Rectangle2D.Float(rectX, rectY, rectW, rectH);
        stripper.addRegion("selection", rect);
        stripper.extractRegions(pdfPage);

        return stripper.getTextForRegion("selection");
    }
}