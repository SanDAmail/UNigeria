
-- Function to get the latest message for each chat_id for a given user
CREATE OR REPLACE FUNCTION get_latest_messages_for_user()
RETURNS TABLE(chat_id TEXT, message_content JSONB, created_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.chat_id,
        cm.message_content,
        cm.created_at
    FROM
        chat_messages cm
    WHERE
        cm.user_id = auth.uid()
    AND
        cm.created_at = (
            SELECT MAX(cm2.created_at)
            FROM chat_messages cm2
            WHERE cm2.user_id = cm.user_id AND cm2.chat_id = cm.chat_id
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment topic reply count
CREATE OR REPLACE FUNCTION increment_topic_reply_count(topic_id_arg UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE forum_topics
    SET reply_count = reply_count + 1
    WHERE id = topic_id_arg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement topic reply count
CREATE OR REPLACE FUNCTION decrement_topic_reply_count(topic_id_arg UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE forum_topics
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = topic_id_arg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_reputation(
    user_id_arg UUID,
    event_type_arg TEXT,
    points_arg INT,
    related_id_arg TEXT DEFAULT NULL,
    related_text_arg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update the user's total reputation score
    UPDATE profiles
    SET reputation_score = reputation_score + points_arg
    WHERE id = user_id_arg;

    -- Log the reputation event
    INSERT INTO reputation_events (user_id, event_type, points, related_id, related_text)
    VALUES (user_id_arg, event_type_arg, points_arg, related_id_arg, related_text_arg);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has endorsed a candidate in their LGA for the current election cycle
CREATE OR REPLACE FUNCTION has_endorsed_in_lga_cycle(
    p_endorser_id UUID,
    p_election_cycle TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_endorser_lga TEXT;
    v_has_endorsed BOOLEAN;
BEGIN
    -- Get the endorser's LGA
    SELECT lga INTO v_endorser_lga FROM profiles WHERE id = p_endorser_id;

    IF v_endorser_lga IS NULL THEN
        RETURN FALSE; -- Endorser has no LGA set
    END IF;

    -- Check if the endorser has already endorsed someone in the same LGA for the given election cycle
    SELECT EXISTS (
        SELECT 1
        FROM endorsements e
        JOIN profiles p ON e.candidate_id = p.id
        WHERE e.endorser_id = p_endorser_id
          AND e.election_cycle = p_election_cycle
          AND p.lga = v_endorser_lga
    ) INTO v_has_endorsed;

    RETURN v_has_endorsed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard(
    state_filter TEXT DEFAULT NULL,
    lga_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    avatar TEXT,
    reputation_score INT,
    state TEXT,
    lga TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.avatar,
        p.reputation_score,
        p.location->>'state' AS state,
        p.location->>'lga' AS lga
    FROM
        profiles p
    WHERE
        (state_filter IS NULL OR p.location->>'state' = state_filter)
        AND (lga_filter IS NULL OR p.location->>'lga' = lga_filter)
    ORDER BY
        p.reputation_score DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
