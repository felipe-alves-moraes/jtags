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
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Set;

@Path("/fragments/users")
public class UserFragmentResource {

    @Inject
    @Location("fragments/user-table.html")
    Template userTable;

    @Inject
    UserService userService;

    private final List<TableColumn> columns = List.of(
        new TableColumn("id", "ID"),
        new TableColumn("name", "Name"),
        new TableColumn("email", "Email"),
        new TableColumn("role", "Role")
    );

    private final List<ToolbarAction> toolbarActions = List.of(
        new ToolbarAction("delete", "Delete", "trash", "/fragments/users/table", "DELETE", true, "Delete selected items?",
            true),
        new ToolbarAction("archive", "Archive", "archive", "/api/users/archive", "POST", true, "Archive selected items?", true),
        new ToolbarAction("export", "Export", "export", "/api/users/export", "GET", true, "Confirm?", false),
        new ToolbarAction("refresh", "Refresh", "refresh", "/fragments/users/table", "GET", false, null, false)
    );

    @GET
    @Path("/table")
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance table(
        @QueryParam("searchField") String searchField,
        @QueryParam("search") String search,
        @QueryParam("sort") @DefaultValue("id") String sort,
        @QueryParam("asc") @DefaultValue("true") boolean ascending,
        @QueryParam("page") @DefaultValue("1") int page,
        @QueryParam("size") @DefaultValue("5") int size) {

        final var pagedItems = userService.findAll(searchField, search, sort, ascending, page, size);

        final var state = new TableState<>(
            pagedItems,
            sort,
            ascending,
            search,
            searchField
        );

        final var config = new TableConfig(
            "/fragments/users/table",
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

        return userTable
            .data("state", state)
            .data("config", config);
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
        @QueryParam("selectionMode") String type,
        @QueryParam("ids") Set<Long> ids,
        @QueryParam("searchField") String searchField,
        @QueryParam("search") String search) {

        if (type.equals("ids")) {
            userService.bulkDelete(ids);
        } else {
            userService.bulkDelete(searchField, search);
        }

        return Response.noContent().header("HX-Trigger", "table-refresh").build();
    }
}
