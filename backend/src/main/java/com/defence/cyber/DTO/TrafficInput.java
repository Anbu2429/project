package com.defence.cyber.DTO;

import lombok.Data;

@Data
public class TrafficInput {

    private String sourceIp;
    private String destinationIp;
    private Integer destinationPort;

    private Double packetRate;           // packets/sec
    private Integer failedLogins;        // brute force detection
    private Double unusualPayloadScore;  // anomaly indicator

    // ADD THESE (important for ML accuracy)
    private Double flowDuration;
    private Double totalForwardPackets;
    private Double totalBackwardPackets;
}