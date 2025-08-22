CREATE TABLE message (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT CHECK (role in ('USER','ASSISTANT','TOOL')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_message_session_id ON message(session_id);
CREATE INDEX idx_message_created_at ON message(created_at);
