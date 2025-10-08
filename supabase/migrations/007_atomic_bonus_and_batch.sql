-- Atomic function to claim early bonus slot (prevents race conditions)
CREATE OR REPLACE FUNCTION claim_early_bonus_slot()
RETURNS JSON AS $$
DECLARE
  v_slots_remaining INTEGER;
  v_success BOOLEAN;
BEGIN
  -- Lock the row and check/decrement in one atomic operation
  UPDATE liquidity_pool
  SET
    rft_bonus_slots_remaining = CASE
      WHEN rft_bonus_slots_remaining > 0 THEN rft_bonus_slots_remaining - 1
      ELSE 0
    END,
    rft_bonus_active = CASE
      WHEN rft_bonus_slots_remaining > 1 THEN true
      ELSE false
    END,
    updated_at = NOW()
  WHERE id = 1
  AND rft_bonus_active = true
  AND rft_bonus_slots_remaining > 0
  RETURNING rft_bonus_slots_remaining INTO v_slots_remaining;

  -- If we got a row back, the bonus was successfully claimed
  v_success := FOUND;

  RETURN json_build_object(
    'success', v_success,
    'slots_remaining', COALESCE(v_slots_remaining, 0)
  );
END;
$$ LANGUAGE plpgsql;

-- Batch update deposits for distribution (prevents N+1 queries)
CREATE OR REPLACE FUNCTION batch_update_deposits_for_distribution(
  p_distribution_id UUID,
  p_timestamp TIMESTAMP
)
RETURNS void AS $$
BEGIN
  -- Update all active deposits at once
  UPDATE deposits d
  SET
    current_value = current_value + (d.amount * 0.02),
    total_earned_usdc = total_earned_usdc + (d.amount * 0.02),
    rft_earned = rft_earned + (d.amount * d.rft_rate),
    last_distribution_at = p_timestamp
  WHERE d.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION claim_early_bonus_slot TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION batch_update_deposits_for_distribution TO authenticated, service_role;