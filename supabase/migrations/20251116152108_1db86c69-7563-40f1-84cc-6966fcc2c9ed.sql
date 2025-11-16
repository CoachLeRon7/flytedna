-- Add CHECK constraints for assessment score validation (1-5 range)

-- Assessments table (self-assessments with 6 questions per domain)
ALTER TABLE assessments
  ADD CONSTRAINT check_l1_range CHECK (l1 IS NULL OR (l1 >= 1 AND l1 <= 5)),
  ADD CONSTRAINT check_l2_range CHECK (l2 IS NULL OR (l2 >= 1 AND l2 <= 5)),
  ADD CONSTRAINT check_l3_range CHECK (l3 IS NULL OR (l3 >= 1 AND l3 <= 5)),
  ADD CONSTRAINT check_l4_range CHECK (l4 IS NULL OR (l4 >= 1 AND l4 <= 5)),
  ADD CONSTRAINT check_l5_range CHECK (l5 IS NULL OR (l5 >= 1 AND l5 <= 5)),
  ADD CONSTRAINT check_l6_range CHECK (l6 IS NULL OR (l6 >= 1 AND l6 <= 5)),
  ADD CONSTRAINT check_e1_range CHECK (e1 IS NULL OR (e1 >= 1 AND e1 <= 5)),
  ADD CONSTRAINT check_e2_range CHECK (e2 IS NULL OR (e2 >= 1 AND e2 <= 5)),
  ADD CONSTRAINT check_e3_range CHECK (e3 IS NULL OR (e3 >= 1 AND e3 <= 5)),
  ADD CONSTRAINT check_e4_range CHECK (e4 IS NULL OR (e4 >= 1 AND e4 <= 5)),
  ADD CONSTRAINT check_e5_range CHECK (e5 IS NULL OR (e5 >= 1 AND e5 <= 5)),
  ADD CONSTRAINT check_e6_range CHECK (e6 IS NULL OR (e6 >= 1 AND e6 <= 5)),
  ADD CONSTRAINT check_a1_range CHECK (a1 IS NULL OR (a1 >= 1 AND a1 <= 5)),
  ADD CONSTRAINT check_a2_range CHECK (a2 IS NULL OR (a2 >= 1 AND a2 <= 5)),
  ADD CONSTRAINT check_a3_range CHECK (a3 IS NULL OR (a3 >= 1 AND a3 <= 5)),
  ADD CONSTRAINT check_a4_range CHECK (a4 IS NULL OR (a4 >= 1 AND a4 <= 5)),
  ADD CONSTRAINT check_a5_range CHECK (a5 IS NULL OR (a5 >= 1 AND a5 <= 5)),
  ADD CONSTRAINT check_a6_range CHECK (a6 IS NULL OR (a6 >= 1 AND a6 <= 5)),
  ADD CONSTRAINT check_d1_range CHECK (d1 IS NULL OR (d1 >= 1 AND d1 <= 5)),
  ADD CONSTRAINT check_d2_range CHECK (d2 IS NULL OR (d2 >= 1 AND d2 <= 5)),
  ADD CONSTRAINT check_d3_range CHECK (d3 IS NULL OR (d3 >= 1 AND d3 <= 5)),
  ADD CONSTRAINT check_d4_range CHECK (d4 IS NULL OR (d4 >= 1 AND d4 <= 5)),
  ADD CONSTRAINT check_d5_range CHECK (d5 IS NULL OR (d5 >= 1 AND d5 <= 5)),
  ADD CONSTRAINT check_d6_range CHECK (d6 IS NULL OR (d6 >= 1 AND d6 <= 5)),
  ADD CONSTRAINT check_b1_range CHECK (b1 IS NULL OR (b1 >= 1 AND b1 <= 5)),
  ADD CONSTRAINT check_b2_range CHECK (b2 IS NULL OR (b2 >= 1 AND b2 <= 5)),
  ADD CONSTRAINT check_b3_range CHECK (b3 IS NULL OR (b3 >= 1 AND b3 <= 5)),
  ADD CONSTRAINT check_b4_range CHECK (b4 IS NULL OR (b4 >= 1 AND b4 <= 5)),
  ADD CONSTRAINT check_b5_range CHECK (b5 IS NULL OR (b5 >= 1 AND b5 <= 5)),
  ADD CONSTRAINT check_b6_range CHECK (b6 IS NULL OR (b6 >= 1 AND b6 <= 5));

-- Peer assessments table (3 questions per domain)
ALTER TABLE peer_assessments
  ADD CONSTRAINT check_peer_l1_range CHECK (l1 IS NULL OR (l1 >= 1 AND l1 <= 5)),
  ADD CONSTRAINT check_peer_l2_range CHECK (l2 IS NULL OR (l2 >= 1 AND l2 <= 5)),
  ADD CONSTRAINT check_peer_l3_range CHECK (l3 IS NULL OR (l3 >= 1 AND l3 <= 5)),
  ADD CONSTRAINT check_peer_e1_range CHECK (e1 IS NULL OR (e1 >= 1 AND e1 <= 5)),
  ADD CONSTRAINT check_peer_e2_range CHECK (e2 IS NULL OR (e2 >= 1 AND e2 <= 5)),
  ADD CONSTRAINT check_peer_e3_range CHECK (e3 IS NULL OR (e3 >= 1 AND e3 <= 5)),
  ADD CONSTRAINT check_peer_a1_range CHECK (a1 IS NULL OR (a1 >= 1 AND a1 <= 5)),
  ADD CONSTRAINT check_peer_a2_range CHECK (a2 IS NULL OR (a2 >= 1 AND a2 <= 5)),
  ADD CONSTRAINT check_peer_a3_range CHECK (a3 IS NULL OR (a3 >= 1 AND a3 <= 5)),
  ADD CONSTRAINT check_peer_d1_range CHECK (d1 IS NULL OR (d1 >= 1 AND d1 <= 5)),
  ADD CONSTRAINT check_peer_d2_range CHECK (d2 IS NULL OR (d2 >= 1 AND d2 <= 5)),
  ADD CONSTRAINT check_peer_d3_range CHECK (d3 IS NULL OR (d3 >= 1 AND d3 <= 5)),
  ADD CONSTRAINT check_peer_b1_range CHECK (b1 IS NULL OR (b1 >= 1 AND b1 <= 5)),
  ADD CONSTRAINT check_peer_b2_range CHECK (b2 IS NULL OR (b2 >= 1 AND b2 <= 5)),
  ADD CONSTRAINT check_peer_b3_range CHECK (b3 IS NULL OR (b3 >= 1 AND b3 <= 5));

-- Coach assessments table (3 questions per domain)
ALTER TABLE coach_assessments
  ADD CONSTRAINT check_coach_l1_range CHECK (l1 IS NULL OR (l1 >= 1 AND l1 <= 5)),
  ADD CONSTRAINT check_coach_l2_range CHECK (l2 IS NULL OR (l2 >= 1 AND l2 <= 5)),
  ADD CONSTRAINT check_coach_l3_range CHECK (l3 IS NULL OR (l3 >= 1 AND l3 <= 5)),
  ADD CONSTRAINT check_coach_e1_range CHECK (e1 IS NULL OR (e1 >= 1 AND e1 <= 5)),
  ADD CONSTRAINT check_coach_e2_range CHECK (e2 IS NULL OR (e2 >= 1 AND e2 <= 5)),
  ADD CONSTRAINT check_coach_e3_range CHECK (e3 IS NULL OR (e3 >= 1 AND e3 <= 5)),
  ADD CONSTRAINT check_coach_a1_range CHECK (a1 IS NULL OR (a1 >= 1 AND a1 <= 5)),
  ADD CONSTRAINT check_coach_a2_range CHECK (a2 IS NULL OR (a2 >= 1 AND a2 <= 5)),
  ADD CONSTRAINT check_coach_a3_range CHECK (a3 IS NULL OR (a3 >= 1 AND a3 <= 5)),
  ADD CONSTRAINT check_coach_d1_range CHECK (d1 IS NULL OR (d1 >= 1 AND d1 <= 5)),
  ADD CONSTRAINT check_coach_d2_range CHECK (d2 IS NULL OR (d2 >= 1 AND d2 <= 5)),
  ADD CONSTRAINT check_coach_d3_range CHECK (d3 IS NULL OR (d3 >= 1 AND d3 <= 5)),
  ADD CONSTRAINT check_coach_b1_range CHECK (b1 IS NULL OR (b1 >= 1 AND b1 <= 5)),
  ADD CONSTRAINT check_coach_b2_range CHECK (b2 IS NULL OR (b2 >= 1 AND b2 <= 5)),
  ADD CONSTRAINT check_coach_b3_range CHECK (b3 IS NULL OR (b3 >= 1 AND b3 <= 5));

-- Guardian assessments table (3 questions per domain)
ALTER TABLE guardian_assessments
  ADD CONSTRAINT check_guardian_l1_range CHECK (l1 IS NULL OR (l1 >= 1 AND l1 <= 5)),
  ADD CONSTRAINT check_guardian_l2_range CHECK (l2 IS NULL OR (l2 >= 1 AND l2 <= 5)),
  ADD CONSTRAINT check_guardian_l3_range CHECK (l3 IS NULL OR (l3 >= 1 AND l3 <= 5)),
  ADD CONSTRAINT check_guardian_e1_range CHECK (e1 IS NULL OR (e1 >= 1 AND e1 <= 5)),
  ADD CONSTRAINT check_guardian_e2_range CHECK (e2 IS NULL OR (e2 >= 1 AND e2 <= 5)),
  ADD CONSTRAINT check_guardian_e3_range CHECK (e3 IS NULL OR (e3 >= 1 AND e3 <= 5)),
  ADD CONSTRAINT check_guardian_a1_range CHECK (a1 IS NULL OR (a1 >= 1 AND a1 <= 5)),
  ADD CONSTRAINT check_guardian_a2_range CHECK (a2 IS NULL OR (a2 >= 1 AND a2 <= 5)),
  ADD CONSTRAINT check_guardian_a3_range CHECK (a3 IS NULL OR (a3 >= 1 AND a3 <= 5)),
  ADD CONSTRAINT check_guardian_d1_range CHECK (d1 IS NULL OR (d1 >= 1 AND d1 <= 5)),
  ADD CONSTRAINT check_guardian_d2_range CHECK (d2 IS NULL OR (d2 >= 1 AND d2 <= 5)),
  ADD CONSTRAINT check_guardian_d3_range CHECK (d3 IS NULL OR (d3 >= 1 AND d3 <= 5)),
  ADD CONSTRAINT check_guardian_b1_range CHECK (b1 IS NULL OR (b1 >= 1 AND b1 <= 5)),
  ADD CONSTRAINT check_guardian_b2_range CHECK (b2 IS NULL OR (b2 >= 1 AND b2 <= 5)),
  ADD CONSTRAINT check_guardian_b3_range CHECK (b3 IS NULL OR (b3 >= 1 AND b3 <= 5));