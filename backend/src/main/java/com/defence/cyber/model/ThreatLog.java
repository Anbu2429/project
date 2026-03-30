package com.defence.cyber.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "threat_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreatLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // NETWORK TRAFFIC DETAILS
    @Column(name = "source_ip", nullable = false, length = 45)
    private String sourceIp;

    @Column(name = "destination_ip", nullable = false, length = 45)
    private String destinationIp;

    @Column(name = "destination_port")
    private Integer destinationPort;

    @Column(name = "packet_rate", nullable = false)
    private Double packetRate;

    @Column(name = "failed_logins")
    private Integer failedLogins;

    @Column(name = "unusual_payload_score")
    private Double unusualPayloadScore;

    @Column(name = "label")
    private String label;

    @Column(name = "trust_score", nullable = false)
    private Double trustScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private SeverityLevel severity;

    @Column(name = "explanation_summary", length = 1000)
    private String explanationSummary;


    // 🔐 LOGIN DETECTION FIELDS (NEW)

    @Column(name = "username")
    private String username;

    @Column(name = "threat_type")
    private String threatType;

    @Column(name = "message")
    private String message;


    // TIMESTAMP
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}