package com.fmoraes.ui;

import com.fmoraes.jtags.table.TableColumn;
import com.fmoraes.jtags.table.TableConfig;
import com.fmoraes.jtags.table.TableState;
import com.fmoraes.jtags.table.ToolbarAction;
import com.fmoraes.service.UserService;
import io.quarkus.qute.Location;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.List;
import java.util.Set;

@Path("/users")
public class UserPageResource {

    @Inject
    Template users;
    @Inject
    @Location("fragments/user-table.html")
    Template userTable;

    @Inject
    @Location("fragments/delete-confirm.html")
    Template deleteConfirm;

    @Context
    UriInfo uriInfo;

    @Inject
    UserService userService;

    private final List<TableColumn> columns = List.of(
        new TableColumn("id", "ID"),
        new TableColumn("name", "Name"),
        new TableColumn("email", "Email"),
        new TableColumn("role", "Role")
    );

    private final List<ToolbarAction> toolbarActions = List.of(
        new ToolbarAction("delete", "Delete", "trash", "/users/table", "DELETE", true,
            "Delete selected items?",
            true),
        new ToolbarAction("archive", "Archive", "archive", "/api/users/archive", "POST", true,
            "Archive selected items?", true),
        new ToolbarAction("export", "Export", "export", "/api/users/export", "GET", true, "Confirm?", false),
        new ToolbarAction("refresh", "Refresh", "refresh", "/users/table", "GET", false, null, false)
    );

    @GET
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance get(
        @QueryParam("searchField") String searchField,
        @QueryParam("search") String search,
        @QueryParam("sort") @DefaultValue("id") String sort,
        @QueryParam("asc") @DefaultValue("true") boolean ascending,
        @QueryParam("page") @DefaultValue("1") int page,
        @QueryParam("size") @DefaultValue("5") int size) {

        var pagedItems = userService.findAll(searchField, search, sort, ascending, page, size);

        final var state = new TableState<>(
            pagedItems,
            sort,
            ascending,
            search,
            searchField
        );

        final var config = new TableConfig(
            "/users/table",
            columns,
            "id",
            true,
            Set.of(
                "name",
                "email",
                "role"
            ),
            true,
            toolbarActions);

        return users
            .data("state", state)
            .data("config", config);
    }

    @GET
    @Path("/table")
    @Produces(MediaType.TEXT_HTML)
    public Response table(
        @HeaderParam("HX-Request") String hxRequest,
        @QueryParam("searchField") String searchField,
        @QueryParam("search") String search,
        @QueryParam("sort") @DefaultValue("id") String sort,
        @QueryParam("asc") @DefaultValue("true") boolean ascending,
        @QueryParam("page") @DefaultValue("1") int page,
        @QueryParam("size") @DefaultValue("5") int size) {

        // If not an HTMX request, redirect to the full page with query params preserved
        if (hxRequest == null) {
            var query = uriInfo.getRequestUri().getRawQuery();
            var fullPageUri = URI.create("/users" + (query != null ? "?" + query : ""));
            return Response.seeOther(fullPageUri).build();
        }

        final var pagedItems = userService.findAll(searchField, search, sort, ascending, page, size);

        final var state = new TableState<>(
            pagedItems,
            sort,
            ascending,
            search,
            searchField
        );

        final var config = new TableConfig(
            "/users/table",
            columns,
            "id",
            true,
            Set.of(
                "name",
                "email",
                "role"
            ),
            true,
            toolbarActions);

        var html = userTable
            .data("state", state)
            .data("config", config)
            .render();

        return Response.ok(html).build();
    }

    @GET
    @Path("/table/confirm")
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance deleteConfirmation(
        @QueryParam("select-item") List<String> selectedIds,
        @QueryParam("selectionMode") @DefaultValue("ids") String selectionMode,
        @QueryParam("searchField") String searchField,
        @QueryParam("search") String search) {

        int count;
        boolean isFilterMode = "filter".equals(selectionMode);

        if (isFilterMode) {
            // Count all items matching the current filter
            count = userService.countAll(searchField, search);
        } else {
            count = selectedIds != null ? selectedIds.size() : 0;
        }

        boolean hasFilter = searchField != null && !searchField.isBlank()
            && search != null && !search.isBlank();

        return deleteConfirm
            .data("count", count)
            .data("hasFilter", hasFilter)
            .data("isFilterMode", isFilterMode)
            .data("searchField", searchField)
            .data("search", search);
    }

    @DELETE
    @Path("/table/{id}")
    @Produces(MediaType.TEXT_HTML)
    public Response delete(@PathParam("id") String id) {

        userService.delete(id);

        return Response.noContent().header("HX-Trigger", "table-refresh").build();
    }

    @DELETE
    @Path("/table")
    @Produces(MediaType.TEXT_HTML)
    public Response bulkDelete(
        @QueryParam("select-item") List<Long> selectedIds,
        @QueryParam("selectionMode") @DefaultValue("ids") String selectionMode,
        @QueryParam("searchField") String searchField,
        @QueryParam("search") String search) {

        boolean isFilterMode = "filter".equals(selectionMode);

        if (isFilterMode) {
            // Delete all items matching the current filter
            userService.bulkDelete(searchField, search);
        } else if (selectedIds != null && !selectedIds.isEmpty()) {
            // Delete specific selected items
            userService.bulkDelete(Set.copyOf(selectedIds));
        }

        return Response.noContent()
            .header("HX-Trigger", "jtags-table-refresh")
            .build();
    }
}
