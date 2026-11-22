package com.foodbridge.service;

import com.foodbridge.dto.CollectDonationRequest;
import com.foodbridge.dto.CreateDonationRequest;
import com.foodbridge.dto.DonationResponse;
import com.foodbridge.dto.UpdateDonationRequest;
import com.foodbridge.entity.Donation;
import com.foodbridge.entity.DonationStatus;
import com.foodbridge.entity.Role;
import com.foodbridge.entity.User;
import com.foodbridge.exception.DonationAlreadyCollectedException;
import com.foodbridge.exception.InvalidOperationException;
import com.foodbridge.exception.ResourceNotFoundException;
import com.foodbridge.repository.DonationRepository;
import com.foodbridge.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public DonationService(
            DonationRepository donationRepository,
            UserRepository userRepository,
            UserService userService) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional
    public DonationResponse create(CreateDonationRequest request) {
        validateTimes(request.preparedTime(), request.expiryTime());
        User current = userService.getCurrentAuthenticatedUser();
        if (!current.getId().equals(request.donorId())) {
            throw new InvalidOperationException("Cannot create donation on behalf of another user");
        }
        User donor = requireUser(request.donorId());
        if (donor.getRole() != Role.DONOR) {
            throw new InvalidOperationException("Only users with the DONOR role can add a food donation");
        }

        Donation donation = new Donation();
        donation.setFoodName(request.foodName().trim());
        donation.setQuantity(request.quantity());
        donation.setPreparedTime(request.preparedTime());
        donation.setExpiryTime(request.expiryTime());
        donation.setPickupLocation(request.pickupLocation().trim());
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonor(donor);
        return toResponse(donationRepository.save(donation));
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listAvailable() {
        return donationRepository.findByStatusOrderByExpiryTimeAsc(DonationStatus.AVAILABLE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listAll() {
        return donationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listByDonor(Long donorId) {
        User current = userService.getCurrentAuthenticatedUser();
        if (current.getRole() != Role.ADMIN && !current.getId().equals(donorId)) {
            throw new InvalidOperationException("You can only view your own donations");
        }
        return donationRepository.findByDonorIdOrderByCreatedAtDesc(donorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listByNgo(Long ngoId) {
        User current = userService.getCurrentAuthenticatedUser();
        if (current.getRole() != Role.ADMIN && !current.getId().equals(ngoId)) {
            throw new InvalidOperationException("You can only view your own collected history");
        }
        return donationRepository.findByCollectedByIdOrderByCollectedAtDesc(ngoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonationResponse getById(Long id) {
        return toResponse(requireDonation(id));
    }

    @Transactional
    public DonationResponse update(Long id, UpdateDonationRequest request) {
        validateTimes(request.preparedTime(), request.expiryTime());
        User current = userService.getCurrentAuthenticatedUser();
        Donation donation = requireDonation(id);
        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new InvalidOperationException("Only available donations can be updated");
        }
        if (!donation.getDonor().getId().equals(request.donorId()) || !current.getId().equals(request.donorId())) {
            throw new InvalidOperationException("Only the donor who created this donation can update it");
        }

        donation.setFoodName(request.foodName().trim());
        donation.setQuantity(request.quantity());
        donation.setPreparedTime(request.preparedTime());
        donation.setExpiryTime(request.expiryTime());
        donation.setPickupLocation(request.pickupLocation().trim());
        return toResponse(donation);
    }

    @Transactional
    public void delete(Long id, Long donorId) {
        User current = userService.getCurrentAuthenticatedUser();
        Donation donation = requireDonation(id);
        if (!donation.getDonor().getId().equals(donorId) || !current.getId().equals(donorId)) {
            throw new InvalidOperationException("Only the donor who created this donation can delete it");
        }
        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new InvalidOperationException("Collected donations cannot be deleted");
        }
        donationRepository.delete(donation);
    }

    @Transactional
    public void adminDelete(Long id) {
        Donation donation = requireDonation(id);
        donationRepository.delete(donation);
    }

    @Transactional
    public DonationResponse collect(Long id, CollectDonationRequest request) {
        User current = userService.getCurrentAuthenticatedUser();
        if (!current.getId().equals(request.ngoId())) {
            throw new InvalidOperationException("Cannot collect donation on behalf of another NGO");
        }
        Donation donation = requireDonation(id);
        if (donation.getStatus() == DonationStatus.COLLECTED) {
            throw new DonationAlreadyCollectedException("This donation has already been collected");
        }

        User ngo = requireUser(request.ngoId());
        if (ngo.getRole() != Role.NGO) {
            throw new InvalidOperationException("Only users with the NGO role can collect a donation");
        }
        if (!donation.getExpiryTime().isAfter(LocalDateTime.now())) {
            throw new InvalidOperationException("This donation has expired and can no longer be collected");
        }

        donation.setStatus(DonationStatus.COLLECTED);
        donation.setCollectedBy(ngo);
        donation.setCollectedAt(LocalDateTime.now());
        return toResponse(donationRepository.save(donation));
    }

    private void validateTimes(LocalDateTime preparedTime, LocalDateTime expiryTime) {
        if (!expiryTime.isAfter(preparedTime)) {
            throw new InvalidOperationException("Expiry time must be after the prepared time");
        }
        if (!expiryTime.isAfter(LocalDateTime.now())) {
            throw new InvalidOperationException("Expiry time must be in the future");
        }
    }

    private User requireUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private Donation requireDonation(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + id));
    }

    private DonationResponse toResponse(Donation donation) {
        User donor = donation.getDonor();
        User collectedBy = donation.getCollectedBy();
        return new DonationResponse(
                donation.getId(),
                donation.getFoodName(),
                donation.getQuantity(),
                donation.getPreparedTime(),
                donation.getExpiryTime(),
                donation.getPickupLocation(),
                donation.getStatus(),
                donor.getId(),
                donor.getName(),
                collectedBy == null ? null : collectedBy.getId(),
                collectedBy == null ? null : collectedBy.getName(),
                donation.getCollectedAt(),
                donation.getCreatedAt()
        );
    }
}