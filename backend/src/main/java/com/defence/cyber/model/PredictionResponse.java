package com.defence.cyber.model;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {

    private Long logId;
    private String label;
    private String attackDescription;   // ← ADD THIS
    private Double trustScore;
    private String severity;
    private List<String> explanations;
}