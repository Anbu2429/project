package com.defence.cyber.controller;

import com.defence.cyber.model.*;
import com.defence.cyber.service.ThreatDetectionService;
import com.defence.cyber.repository.ThreatLogRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/threat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ThreatController {

    private final ThreatDetectionService threatDetectionService;
    private final ThreatLogRepository threatLogRepository;

    // ============================================
    // ✅ 1. ANALYZE TRAFFIC (MAIN API)
    // ============================================
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeTraffic(@Valid @RequestBody TrafficInput input) {
        try {

            if (input == null) {
                return ResponseEntity.badRequest()
                        .body("❌ Input cannot be null");
            }

            PredictionResponse response =
                    threatDetectionService.analyzeTraffic(input);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error during analysis: " + e.getMessage());
        }
    }

    // ============================================
    // ✅ 2. GET ALL LOGS
    // ============================================
    @GetMapping("/logs")
    public ResponseEntity<?> getAllLogs() {
        try {

            List<ThreatLog> logs = threatLogRepository.findAll();

            if (logs == null || logs.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            return ResponseEntity.ok(logs);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error fetching logs: " + e.getMessage());
        }
    }

    // ============================================
    // ✅ 3. GET LOG BY ID (FIXED ERROR)
    // ============================================
    @GetMapping("/logs/{id}")
    public ResponseEntity<?> getLogById(@PathVariable Long id) {
        try {

            Optional<ThreatLog> log = threatLogRepository.findById(id);

            if (log.isPresent()) {
                return ResponseEntity.ok(log.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ Log not found with ID: " + id);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error fetching log: " + e.getMessage());
        }
    }

    // ============================================
    // ✅ 4. DELETE LOG
    // ============================================
    @DeleteMapping("/logs/{id}")
    public ResponseEntity<?> deleteLog(@PathVariable Long id) {
        try {

            if (!threatLogRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ Log not found with ID: " + id);
            }

            threatLogRepository.deleteById(id);

            return ResponseEntity.ok("✅ Log deleted successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error deleting log: " + e.getMessage());
        }
    }

    // ============================================
    // ✅ 5. HEALTH CHECK
    // ============================================
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("✅ Threat Detection Service Running");
    }

    // ============================================
    // ✅ 6. LIVE LOGIN MONITORING
    // ============================================
    @GetMapping("/active-users")
    public ResponseEntity<?> activeUsers() {
        try {

            List<Map<String, Object>> users = threatDetectionService.getLiveLogins();

            if (users == null || users.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            return ResponseEntity.ok(users);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error fetching active users: " + e.getMessage());
        }
    }
}