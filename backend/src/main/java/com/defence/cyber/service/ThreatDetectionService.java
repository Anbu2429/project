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
    private static final String FLASK_LIVE_LOGINS_URL = "http://127.0.0.1:5000/live-logins";

    // -----------------------------------
    // MAIN TRAFFIC ANALYSIS
    // -----------------------------------

    public PredictionResponse analyzeTraffic(TrafficInput input) {

        Map<String, Object> flaskPayload = buildFlaskPayload(input);
        Map<String, Object> flaskBody = callFlaskApi(flaskPayload);

        // -------------------------------
        // 🔥 EXTRACT DATA FROM FLASK
        // -------------------------------
        String attackType  = (String) flaskBody.getOrDefault("Attack_Type", "UNKNOWN");
        String description = (String) flaskBody.getOrDefault("Attack_Description", "No description");
        String riskLevel   = (String) flaskBody.getOrDefault("Risk_Level", "LOW");

        double trustScore = Double.parseDouble(
                flaskBody.getOrDefault("Trust_Score (%)", "0.0").toString()
        );

        List<Map<String, Object>> shapExplanation =
                (List<Map<String, Object>>) flaskBody.getOrDefault("Explanation", List.of());

        String aiExplanation =
                (String) flaskBody.getOrDefault("AI_Explanation", "No AI explanation");

        // -------------------------------
        // 🔥 BUILD FINAL EXPLANATIONS
        // -------------------------------
        List<String> explanations = buildExplanations(
                input,
                attackType,
                trustScore,
                shapExplanation,
                aiExplanation
        );

        SeverityLevel severity = mapSeverity(riskLevel);

        // -------------------------------
        // SAVE TO DB
        // -------------------------------
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

        // -------------------------------
        // RESPONSE TO FRONTEND
        // -------------------------------
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
    // ✅ LIVE LOGIN MONITORING
    // -----------------------------------

    public List<Map<String, Object>> getLiveLogins() {
        try {
            ResponseEntity<List> response =
                    restTemplate.getForEntity(FLASK_LIVE_LOGINS_URL, List.class);

            List<Map<String, Object>> body = response.getBody();

            if (body == null) {
                return List.of();
            }

            return body;

        } catch (Exception e) {
            throw new RuntimeException("Error fetching live logins from Flask: " + e.getMessage());
        }
    }

    // -----------------------------------
    // CALL FLASK API
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
    // FEATURE MAPPING (NO CHANGE)
    // -----------------------------------

    private Map<String, Object> buildFlaskPayload(TrafficInput input) {

        double packetRate   = input.getPacketRate() != null ? input.getPacketRate() : 0.0;
        int failedLogins    = input.getFailedLogins() != null ? input.getFailedLogins() : 0;
        double payloadScore = input.getUnusualPayloadScore() != null ? input.getUnusualPayloadScore() : 0.0;
        int dstPort         = input.getDestinationPort() != null ? input.getDestinationPort() : 0;

        Map<String, Object> p = new LinkedHashMap<>();

        boolean isDDoS = packetRate > 2000;
        boolean isFTP  = dstPort == 21;
        boolean isSSH  = dstPort == 22;
        boolean isBot  = dstPort == 8080;

        p.put("Dst Port", dstPort);
        p.put("Protocol", (dstPort == 53) ? 17 : 6);

        if (isDDoS) {
            p.put("Flow Duration", 1000);
            p.put("Tot Fwd Pkts", 3000);
            p.put("Tot Bwd Pkts", 0);
            p.put("Flow Pkts/s", 3000);
            p.put("Flow Byts/s", 200000);
        } else {
            p.put("Flow Duration", 60000);
            p.put("Tot Fwd Pkts", 10);
            p.put("Tot Bwd Pkts", 10);
            p.put("Flow Pkts/s", 50);
        }

        p.put("Pkt Len Mean", isDDoS ? 10 : 60);
        p.put("Pkt Len Std", isDDoS ? 5 : 30);

        p.put("SYN Flag Cnt", failedLogins > 5 ? 1 : 0);
        p.put("ACK Flag Cnt", 1);
        p.put("RST Flag Cnt", isDDoS ? 1 : 0);
        p.put("PSH Flag Cnt", payloadScore > 5 ? 1 : 0);

        return p;
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
    // 🔥 FINAL EXPLANATION ENGINE
    // -----------------------------------

    private List<String> buildExplanations(
            TrafficInput input,
            String attackType,
            double trustScore,
            List<Map<String, Object>> shapExplanation,
            String aiExplanation) {

        List<String> explanations = new ArrayList<>();

        // -------------------------------
        // 🔥 SHAP EXPLANATION
        // -------------------------------
        if (shapExplanation != null && !shapExplanation.isEmpty()) {
            for (Map<String, Object> item : shapExplanation) {

                String feature = (String) item.get("feature");
                Object impactObj = item.get("shap_impact");

                double impact = 0;
                if (impactObj instanceof Number) {
                    impact = ((Number) impactObj).doubleValue();
                }

                if (Math.abs(impact) > 0.01) {
                    explanations.add(
                        "Feature: " + feature + " → Impact: " + impact
                    );
                }
            }
        }

        // -------------------------------
        // RULE-BASED
        // -------------------------------
        if (input.getPacketRate() != null && input.getPacketRate() > 1000) {
            explanations.add("High traffic → Possible DDoS");
        }

        if (input.getFailedLogins() != null && input.getFailedLogins() > 5) {
            explanations.add("Multiple failed logins → Brute-force");
        }

        if (input.getUnusualPayloadScore() != null && input.getUnusualPayloadScore() > 5) {
            explanations.add("Suspicious payload detected");
        }

        // -------------------------------
        // 🔥 AI EXPLANATION
        // -------------------------------
        explanations.add("AI Insight: " + aiExplanation);

        // FINAL
        explanations.add("Prediction: " + attackType + " | Confidence: " + trustScore + "%");

        return explanations;
    }
}