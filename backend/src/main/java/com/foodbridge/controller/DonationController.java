package com.foodbridge.controller;

import com.foodbridge.dto.CollectDonationRequest;
import com.foodbridge.dto.CreateDonationRequest;
import com.foodbridge.dto.DonationResponse;
import com.foodbridge.dto.UpdateDonationRequest;
import com.foodbridge.service.DonationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    public ResponseEntity<DonationResponse> create(@Valid @RequestBody CreateDonationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(donationService.create(request));
    }

    @GetMapping
    public List<DonationResponse> listAvailable() {
        return donationService.listAvailable();
    }

    @GetMapping("/all")
    public List<DonationResponse> listAll() {
        return donationService.listAll();
    }

    @GetMapping("/donor/{donorId}")
    public List<DonationResponse> listByDonor(@PathVariable Long donorId) {
        return donationService.listByDonor(donorId);
    }

    @GetMapping("/ngo/{ngoId}")
    public List<DonationResponse> listByNgo(@PathVariable Long ngoId) {
        return donationService.listByNgo(ngoId);
    }

    @GetMapping("/{id}")
    public DonationResponse getById(@PathVariable Long id) {
        return donationService.getById(id);
    }

    @PutMapping("/{id}")
    public DonationResponse update(@PathVariable Long id, @Valid @RequestBody UpdateDonationRequest request) {
        return donationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam Long donorId) {
        donationService.delete(id, donorId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> adminDelete(@PathVariable Long id) {
        donationService.adminDelete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/collect")
    public DonationResponse collect(@PathVariable Long id, @Valid @RequestBody CollectDonationRequest request) {
        return donationService.collect(id, request);
    }
}