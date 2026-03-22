ALTER TABLE wines                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cellar_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_notes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cellar_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairings             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_wines" ON wines
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_owns_cellar" ON cellar_entries
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_owns_tastings" ON tasting_notes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_reads_own_txns" ON cellar_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_inserts_txns" ON cellar_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "read_pairings" ON pairings
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "user_manages_own_pairings" ON pairings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
