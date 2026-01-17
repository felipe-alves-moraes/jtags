package com.fmoraes.service;

import com.fmoraes.domain.User;
import com.fmoraes.jtags.table.Page;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

@ApplicationScoped
public class UserService {

    // Fake data for now - we'll add DB later if needed
    private List<User> users = List.of(
        new User(1L, "Alice Johnson", "alice@example.com", "Admin"),
        new User(2L, "Bob Smith", "bob@example.com", "User"),
        new User(3L, "Carol White", "carol@example.com", "User"),
        new User(4L, "David Brown", "david@example.com", "Moderator"),
        new User(5L, "Eve Davis", "eve@example.com", "User"),
        new User(6L, "Frank Miller", "frank@example.com", "User"),
        new User(7L, "Grace Lee", "grace@example.com", "Admin"),
        new User(8L, "Henry Wilson", "henry@example.com", "User"),
        new User(9L, "Ivy Chen", "ivy@example.com", "Moderator"),
        new User(10L, "Jack Taylor", "jack@example.com", "User"),
        new User(11L, "Karen Adams", "karen@example.com", "User"),
        new User(12L, "Leo Martinez", "leo@example.com", "User"),
        new User(13L, "Leo Martinez", "leo@example.com", "User"),
        new User(14L, "Leo Martinez", "leo@example.com", "User"),
        new User(15L, "Leo Martinez", "leo@example.com", "User"),
        new User(16L, "Leo Martinez", "leo@example.com", "User"),
        new User(17L, "Leo Martinez", "leo@example.com", "User"),
        new User(18L, "Leo Martinez", "leo@example.com", "User"),
        new User(19L, "Leo Martinez", "leo@example.com", "User"),
        new User(20L, "Leo Martinez", "leo@example.com", "User"),
        new User(21L, "Leo Martinez", "leo@example.com", "User")
    );

    public Page<User> findAll(String searchField, String search, String sortBy, boolean ascending, int page, int pageSize) {
        var comparator = switch (sortBy) {
            case "name" -> Comparator.comparing(User::name);
            case "email" -> Comparator.comparing(User::email);
            case "role" -> Comparator.comparing(User::role);
            default -> Comparator.comparing(User::id);
        };

        var filter = getFilter(searchField, search);

        if (!ascending) {
            comparator = comparator.reversed();
        }

        final var sorted = users.stream()
            .filter(filter)
            .sorted(comparator).toList();

        final var fromIndex = (page - 1) * pageSize;
        final var toIndex = Math.min(fromIndex + pageSize, sorted.size());

        final List<User> pagedItems = fromIndex < sorted.size() ? sorted.subList(fromIndex, toIndex) : List.of();

        return new Page<>(pagedItems, page, pageSize, sorted.size());
    }

    private Predicate<User> getFilter(String searchField, String search) {
        Predicate<User> filter;
        if (search == null ) {
            filter = it -> true;
        } else {
            filter = switch (searchField) {
                case "name" -> it -> it.name().toLowerCase().contains(search.toLowerCase());
                case "email" -> it -> it.email().toLowerCase().contains(search.toLowerCase());
                case "role" -> it -> it.role().toLowerCase().contains(search.toLowerCase());
                case null, default -> it -> true;
            };
        }
        return filter;
    }

    public void delete(String id) {
        var copyUsers = new ArrayList<>(users);
        copyUsers.removeIf(it -> Long.valueOf(id).equals(it.id()));

        users = List.copyOf(copyUsers);
    }

    public void bulkDelete(Set<Long> ids) {
        var copyUsers = new ArrayList<>(users);
        copyUsers.removeIf(it -> ids.contains(it.id()));

        users = List.copyOf(copyUsers);
    }

    public void bulkDelete(String searchField, String searchTerm) {
        var copyUsers = new ArrayList<>(users);

        final var filter = getFilter(searchField, searchTerm);
        copyUsers.removeIf(filter);

        users = List.copyOf(copyUsers);
    }
}
