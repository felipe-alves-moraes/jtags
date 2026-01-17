package com.fmoraes;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.containsString;

@QuarkusTest
class SampleTest {

    @Test
    void testInfrastructureWorks() {
        // Basic assertion to verify test infrastructure
        assert 1 + 1 == 2;
    }

    @Test
    void testUsersEndpointReturnsHtml() {
        given()
            .when().get("/users")
            .then()
            .statusCode(200)
            .body(containsString("jtags"));
    }
}
