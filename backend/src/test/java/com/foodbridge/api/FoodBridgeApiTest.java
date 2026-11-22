package com.foodbridge.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbridge.entity.Donation;
import com.foodbridge.entity.DonationStatus;
import com.foodbridge.entity.User;
import com.foodbridge.repository.DonationRepository;
import com.foodbridge.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class FoodBridgeApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Test
    void registerStoresHashedPasswordAndRejectsDuplicateEmail() throws Exception {
        String email = uniqueEmail("donor");
        MvcResult created = mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Asha Donor", email, "secret12", "DONOR")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Asha Donor"))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("DONOR"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andReturn();

        long id = readId(created);

        mockMvc.perform(get("/api/users/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.password").doesNotExist());

        User stored = userRepository.findById(id).orElseThrow();
        assertThat(stored.getPassword()).startsWith("$2");
        assertThat(stored.getPassword()).isNotEqualTo("secret12");

        String users = mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(users).contains(email);
        assertThat(users).doesNotContain("secret12");
        assertThat(users).doesNotContain("$2a$");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Asha Donor", email.toUpperCase(), "secret12", "DONOR")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists"));
    }

    @Test
    void registerRejectsInvalidBody() throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("", "not-an-email", "123", "DONOR")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Bad Role", uniqueEmail("bad"), "secret12", "VOLUNTEER")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void donationLifecycleCoversListUpdateCollectAndDuplicateCollection() throws Exception {
        long donorId = register("Ravi Donor", "DONOR");
        long ngoId = register("Helping Hands", "NGO");
        long otherDonorId = register("Other Donor", "DONOR");
        String foodName = "Veg biryani " + UUID.randomUUID();

        MvcResult created = mockMvc.perform(post("/api/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationJson(foodName, 10, donorId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.donorName").value("Ravi Donor"))
                .andExpect(jsonPath("$.collectedById").value(nullValue()))
                .andReturn();

        long donationId = readId(created);
        String createdJson = created.getResponse().getContentAsString();
        assertThat(readLong(createdJson, "$.donorId")).isEqualTo(donorId);

        mockMvc.perform(get("/api/donations/" + donationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodName").value(foodName))
                .andExpect(jsonPath("$.pickupLocation").value("Community Hall, Pune"));

        assertThat(availableNames()).contains(foodName);

        String updatedName = foodName + " updated";
        MvcResult updated = mockMvc.perform(put("/api/donations/" + donationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationJson(updatedName, 8, donorId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodName").value(updatedName))
                .andReturn();
        assertThat(readLong(updated.getResponse().getContentAsString(), "$.quantity")).isEqualTo(8L);

        mockMvc.perform(put("/api/donations/" + donationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationJson(updatedName, 8, otherDonorId)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/donations/" + donationId + "/collect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ngoId\":" + donorId + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only users with the NGO role can collect a donation"));

        mockMvc.perform(post("/api/donations/" + donationId + "/collect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ngoId\":999999}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/donations/" + donationId + "/collect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ngoId\":" + ngoId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COLLECTED"))
                .andExpect(jsonPath("$.collectedByName").value("Helping Hands"));

        String collected = mockMvc.perform(get("/api/donations/" + donationId))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(readLong(collected, "$.collectedById")).isEqualTo(ngoId);
        assertThat(availableNames()).doesNotContain(updatedName);

        mockMvc.perform(post("/api/donations/" + donationId + "/collect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ngoId\":" + ngoId + "}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This donation has already been collected"));

        mockMvc.perform(put("/api/donations/" + donationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationJson(updatedName, 8, donorId)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/api/donations/" + donationId).param("donorId", Long.toString(donorId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Collected donations cannot be deleted"));
    }

    @Test
    void donorCanDeleteAnAvailableDonation() throws Exception {
        long donorId = register("Delete Donor", "DONOR");
        long donationId = createDonation("Bread " + UUID.randomUUID(), donorId);

        mockMvc.perform(delete("/api/donations/" + donationId).param("donorId", "888888888"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/api/donations/" + donationId))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/api/donations/" + donationId).param("donorId", Long.toString(donorId)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/donations/" + donationId))
                .andExpect(status().isNotFound());
    }

    @Test
    void missingDonationAndUserReturn404() throws Exception {
        mockMvc.perform(get("/api/donations/999999"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/users/999999"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/donations/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsInvalidDonationTimesQuantityAndExpiredCollection() throws Exception {
        long donorId = register("Time Donor", "DONOR");
        long ngoId = register("Time NGO", "NGO");

        Map<String, Object> zeroQuantity = donationMap("Soup", 2, donorId);
        zeroQuantity.put("quantity", 0);
        mockMvc.perform(post("/api/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(zeroQuantity)))
                .andExpect(status().isBadRequest());

        Map<String, Object> inverted = donationMap("Soup", 2, donorId);
        inverted.put("preparedTime", LocalDateTime.now().plusHours(5).withNano(0));
        inverted.put("expiryTime", LocalDateTime.now().plusHours(1).withNano(0));
        mockMvc.perform(post("/api/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inverted)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Expiry time must be after the prepared time"));

        Map<String, Object> alreadyExpired = donationMap("Soup", 2, donorId);
        alreadyExpired.put("preparedTime", LocalDateTime.now().minusHours(3).withNano(0));
        alreadyExpired.put("expiryTime", LocalDateTime.now().minusMinutes(5).withNano(0));
        mockMvc.perform(post("/api/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(alreadyExpired)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationJson("Ngo food " + UUID.randomUUID(), 2, ngoId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only users with the DONOR role can add a food donation"));

        User donor = userRepository.findById(donorId).orElseThrow();
        Donation expired = new Donation();
        expired.setFoodName("Old rice " + UUID.randomUUID());
        expired.setQuantity(1);
        expired.setPreparedTime(LocalDateTime.now().minusHours(6));
        expired.setExpiryTime(LocalDateTime.now().minusMinutes(10));
        expired.setPickupLocation("Station road");
        expired.setStatus(DonationStatus.AVAILABLE);
        expired.setDonor(donor);
        Long expiredId = donationRepository.save(expired).getId();

        mockMvc.perform(post("/api/donations/" + expiredId + "/collect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ngoId\":" + ngoId + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This donation has expired and can no longer be collected"));

        mockMvc.perform(get("/api/donations/" + expiredId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    private long register(String name, String role) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson(name, uniqueEmail(role), "secret12", role)))
                .andExpect(status().isCreated())
                .andReturn();
        return readId(result);
    }

    private long createDonation(String foodName, long donorId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationJson(foodName, 3, donorId)))
                .andExpect(status().isCreated())
                .andReturn();
        return readId(result);
    }

    private List<String> availableNames() throws Exception {
        String body = mockMvc.perform(get("/api/donations"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return JsonPath.read(body, "$[*].foodName");
    }

    private long readId(MvcResult result) throws Exception {
        return readLong(result.getResponse().getContentAsString(), "$.id");
    }

    private long readLong(String json, String path) {
        Number value = JsonPath.read(json, path);
        return value.longValue();
    }

    private String uniqueEmail(String label) {
        return label.toLowerCase() + "-" + UUID.randomUUID() + "@example.com";
    }

    private String userJson(String name, String email, String password, String role) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("email", email);
        body.put("password", password);
        body.put("role", role);
        return objectMapper.writeValueAsString(body);
    }

    private String donationJson(String foodName, int quantity, long donorId) throws Exception {
        return objectMapper.writeValueAsString(donationMap(foodName, quantity, donorId));
    }

    private Map<String, Object> donationMap(String foodName, int quantity, long donorId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("foodName", foodName);
        body.put("quantity", quantity);
        body.put("preparedTime", LocalDateTime.now().minusHours(1).withNano(0));
        body.put("expiryTime", LocalDateTime.now().plusHours(6).withNano(0));
        body.put("pickupLocation", "Community Hall, Pune");
        body.put("donorId", donorId);
        return body;
    }
}
