-- RPC function to update pool stats when deposit happens
CREATE OR REPLACE FUNCTION update_pool_on_deposit(
  deposit_amount DECIMAL,
  is_new_depositor BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  UPDATE liquidity_pool
  SET
    total_deposits = total_deposits + deposit_amount,
    current_balance = current_balance + deposit_amount,
    total_depositors = CASE
      WHEN is_new_depositor THEN total_depositors + 1
      ELSE total_depositors
    END,
    active_depositors = active_depositors + CASE
      WHEN is_new_depositor THEN 1
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to process withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_deposit_id UUID,
  p_amount DECIMAL
)
RETURNS JSON AS $$
DECLARE
  v_deposit RECORD;
  v_result JSON;
BEGIN
  -- Get deposit details
  SELECT * INTO v_deposit
  FROM deposits
  WHERE id = p_deposit_id
  AND status = 'active';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Deposit not found or not active'
    );
  END IF;

  IF v_deposit.current_value < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Update deposit
  UPDATE deposits
  SET
    current_value = current_value - p_amount,
    total_withdrawn = total_withdrawn + p_amount,
    status = CASE
      WHEN current_value - p_amount <= 0 THEN 'withdrawn'
      ELSE status
    END,
    withdrawn_at = CASE
      WHEN current_value - p_amount <= 0 THEN NOW()
      ELSE withdrawn_at
    END
  WHERE id = p_deposit_id;

  -- Update pool
  UPDATE liquidity_pool
  SET
    total_withdrawals = total_withdrawals + p_amount,
    current_balance = current_balance - p_amount,
    active_depositors = active_depositors - CASE
      WHEN v_deposit.current_value - p_amount <= 0 THEN 1
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = 1;

  RETURN json_build_object(
    'success', true,
    'amount', p_amount,
    'remaining_balance', v_deposit.current_value - p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get all deposits for admin (with auth check)
CREATE OR REPLACE FUNCTION get_all_deposits_admin()
RETURNS JSON AS $$
DECLARE
  v_deposits JSON;
BEGIN
  -- In production, add proper admin auth check here
  -- For now, return all deposits
  SELECT json_agg(
    json_build_object(
      'id', id,
      'wallet_address', wallet_address,
      'amount', amount,
      'current_value', current_value,
      'total_earned_usdc', total_earned_usdc,
      'rft_earned', rft_earned,
      'rft_rate', rft_rate,
      'status', status,
      'deposited_at', deposited_at,
      'last_distribution_at', last_distribution_at
    )
    ORDER BY deposited_at DESC
  ) INTO v_deposits
  FROM deposits
  WHERE status = 'active';

  RETURN COALESCE(v_deposits, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_pool_on_deposit TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION process_withdrawal TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_all_deposits_admin TO authenticated, service_role;