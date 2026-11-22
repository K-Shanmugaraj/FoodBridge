package com.foodbridge.repository;

import com.foodbridge.entity.Donation;
import com.foodbridge.entity.DonationStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByStatusOrderByExpiryTimeAsc(DonationStatus status);
    List<Donation> findByDonorIdOrderByCreatedAtDesc(Long donorId);
    List<Donation> findByCollectedByIdOrderByCollectedAtDesc(Long collectedById);
    List<Donation> findAllByOrderByCreatedAtDesc();
}