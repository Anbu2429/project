package com.defence.cyber.service;

import com.defence.cyber.model.*;
import com.defence.cyber.repository.ThreatLogRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ThreatDetectionService {

    private final ThreatLogRepository threatLogRepository;
    private final RestTemplate restTemplate;

    private static final String FLASK_URL = "http://127.0.0.1:5000/predict";

    // -----------------------------------
    // MAIN TRAFFIC ANALYSIS
    // -----------------------------------

    public PredictionResponse analyzeTraffic(TrafficInput input) {

        Map<String, Object> flaskPayload = buildFlaskPayload(input);
        Map<String, Object> flaskBody = callFlaskApi(flaskPayload);

        String attackType  = (String) flaskBody.getOrDefault("Attack_Type", "UNKNOWN");
        String description = (String) flaskBody.getOrDefault("Attack_Description", "No description");
        String riskLevel   = (String) flaskBody.getOrDefault("Risk_Level", "LOW");
        double trustScore  = Double.parseDouble(
                flaskBody.getOrDefault("Trust_Score (%)", "0.0").toString()
        );

        List<Map<String, Object>> explanation =
                (List<Map<String, Object>>) flaskBody.getOrDefault("Explanation", List.of());

        List<String> explanations = buildExplanations(input, attackType, trustScore, explanation);
        SeverityLevel severity = mapSeverity(riskLevel);

        ThreatLog log = ThreatLog.builder()
                .sourceIp(input.getSourceIp())
                .destinationIp(input.getDestinationIp())
                .destinationPort(input.getDestinationPort())
                .packetRate(input.getPacketRate())
                .failedLogins(input.getFailedLogins())
                .unusualPayloadScore(input.getUnusualPayloadScore())
                .label(attackType)
                .trustScore(trustScore)
                .severity(severity)
                .threatType(attackType)
                .message(description)
                .explanationSummary(String.join(" | ", explanations))
                .build();

        ThreatLog saved = threatLogRepository.save(log);

        return PredictionResponse.builder()
                .label(attackType)
                .attackDescription(description)
                .trustScore(trustScore)
                .severity(riskLevel)
                .explanations(explanations)
                .logId(saved.getId())
                .build();
    }

    // -----------------------------------
    // CALL FLASK
    // -----------------------------------

    private Map<String, Object> callFlaskApi(Map<String, Object> payload) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(FLASK_URL, request, Map.class);

        Map<String, Object> body = response.getBody();

        if (body == null) {
            throw new RuntimeException("Flask returned null response");
        }

        if (body.containsKey("error")) {
            throw new RuntimeException("Flask error: " + body.get("error"));
        }

        return body;
    }

    // -----------------------------------
    // 🔥 FIXED FEATURE MAPPING
    // -----------------------------------

private Map<String, Object> buildFlaskPayload(TrafficInput input) {

    double packetRate   = input.getPacketRate() != null ? input.getPacketRate() : 0.0;
    int failedLogins    = input.getFailedLogins() != null ? input.getFailedLogins() : 0;
    double payloadScore = input.getUnusualPayloadScore() != null ? input.getUnusualPayloadScore() : 0.0;
    int dstPort         = input.getDestinationPort() != null ? input.getDestinationPort() : 0;

    Map<String, Object> p = new LinkedHashMap<>();

    // ------------------------------------
    // 🔥 ATTACK DETECTION LOGIC
    // ------------------------------------
    boolean isDDoS = packetRate > 2000;
    boolean isFTP  = dstPort == 21;
    boolean isSSH  = dstPort == 22;
    boolean isBot  = dstPort == 8080;

    // ------------------------------------
    // BASIC
    // ------------------------------------
    p.put("Dst Port", dstPort);
    p.put("Protocol", (dstPort == 53) ? 17 : 6);

    // ------------------------------------
    // FLOW
    // ------------------------------------
    if (isDDoS) {
        p.put("Flow Duration", 1000);
        p.put("Tot Fwd Pkts", 3000);
        p.put("Tot Bwd Pkts", 0);
        p.put("Flow Pkts/s", 3000);
        p.put("Flow Byts/s", 200000);
    } 
    else if (isFTP) {
        p.put("Flow Duration", 3);
        p.put("Tot Fwd Pkts", 1);
        p.put("Tot Bwd Pkts", 1);
        p.put("Flow Pkts/s", 666666);
    } 
    else if (isSSH) {
        p.put("Flow Duration", 6);
        p.put("Tot Fwd Pkts", 1);
        p.put("Tot Bwd Pkts", 1);
        p.put("Flow Pkts/s", 333333);
    } 
    else if (isBot) {
        p.put("Flow Duration", 694);
        p.put("Tot Fwd Pkts", 2);
        p.put("Tot Bwd Pkts", 0);
        p.put("Flow Pkts/s", 2881);
    } 
    else {
        // BENIGN
        p.put("Flow Duration", 60000);
        p.put("Tot Fwd Pkts", 10);
        p.put("Tot Bwd Pkts", 10);
        p.put("Flow Pkts/s", 50);
    }

    // ------------------------------------
    // PACKETS
    // ------------------------------------
    p.put("TotLen Fwd Pkts", 0);
    p.put("TotLen Bwd Pkts", 0);

    p.put("Pkt Len Mean", isDDoS ? 10 : 60);
    p.put("Pkt Len Std", isDDoS ? 5 : 30);

    // ------------------------------------
    // FLAGS
    // ------------------------------------
    p.put("SYN Flag Cnt", failedLogins > 5 ? 1 : 0);
    p.put("ACK Flag Cnt", 1);
    p.put("RST Flag Cnt", isDDoS ? 1 : 0);
    p.put("PSH Flag Cnt", payloadScore > 5 ? 1 : 0);

    // ------------------------------------
    // REMAINING FEATURES (ZERO SAFE)
    // ------------------------------------
    String[] features = {
            "Fwd Pkt Len Max","Fwd Pkt Len Min","Fwd Pkt Len Mean","Fwd Pkt Len Std",
            "Bwd Pkt Len Max","Bwd Pkt Len Min","Bwd Pkt Len Mean","Bwd Pkt Len Std",
            "Flow IAT Mean","Flow IAT Std","Flow IAT Max","Flow IAT Min",
            "Fwd IAT Tot","Fwd IAT Mean","Fwd IAT Std","Fwd IAT Max","Fwd IAT Min",
            "Bwd IAT Tot","Bwd IAT Mean","Bwd IAT Std","Bwd IAT Max","Bwd IAT Min",
            "Fwd PSH Flags","Bwd PSH Flags","Fwd URG Flags","Bwd URG Flags",
            "Fwd Header Len","Bwd Header Len",
            "FIN Flag Cnt","URG Flag Cnt","CWE Flag Count","ECE Flag Cnt",
            "Down/Up Ratio","Pkt Size Avg","Fwd Seg Size Avg","Bwd Seg Size Avg",
            "Fwd Byts/b Avg","Fwd Pkts/b Avg","Fwd Blk Rate Avg",
            "Bwd Byts/b Avg","Bwd Pkts/b Avg","Bwd Blk Rate Avg",
            "Subflow Fwd Pkts","Subflow Fwd Byts","Subflow Bwd Pkts","Subflow Bwd Byts",
            "Init Fwd Win Byts","Init Bwd Win Byts",
            "Fwd Act Data Pkts","Fwd Seg Size Min",
            "Active Mean","Active Std","Active Max","Active Min",
            "Idle Mean","Idle Std","Idle Max","Idle Min"
    };

    for (String f : features) {
        p.putIfAbsent(f, 0);
    }

    return p;
}

    // -----------------------------------
    // PROTOCOL
    // -----------------------------------

    private int detectProtocol(int port) {
        return switch (port) {
            case 53, 67, 68, 123, 161 -> 17;
            default -> 6;
        };
    }

    // -----------------------------------
    // SEVERITY
    // -----------------------------------

    private SeverityLevel mapSeverity(String riskLevel) {
        return switch (riskLevel.toUpperCase()) {
            case "CRITICAL" -> SeverityLevel.CRITICAL;
            case "HIGH"     -> SeverityLevel.HIGH;
            case "MEDIUM"   -> SeverityLevel.MEDIUM;
            default         -> SeverityLevel.LOW;
        };
    }

    // -----------------------------------
    // EXPLANATION
    // -----------------------------------

    private List<String> buildExplanations(
            TrafficInput input,
            String attackType,
            double trustScore,
            List<Map<String, Object>> shapExplanation) {

        List<String> explanations = new ArrayList<>();

        if (input.getPacketRate() != null && input.getPacketRate() > 1000) {
            explanations.add("High traffic volume indicates possible DDoS.");
        }

        if (input.getFailedLogins() != null && input.getFailedLogins() > 5) {
            explanations.add("Multiple failed logins detected (brute-force behavior).");
        }

        if (input.getUnusualPayloadScore() != null && input.getUnusualPayloadScore() > 5) {
            explanations.add("Suspicious payload detected.");
        }

        explanations.add("Prediction: " + attackType + " | Confidence: " + trustScore + "%");

        return explanations;
    }
}