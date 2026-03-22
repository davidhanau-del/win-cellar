-- WINES
CREATE TABLE wines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  domain        TEXT,
  region        TEXT NOT NULL,
  sub_region    TEXT,
  country       TEXT NOT NULL DEFAULT 'France',
  appellation   TEXT,
  grape_varieties TEXT[],
  vintage       SMALLINT,
  color         TEXT CHECK (color IN ('red','white','rosé','sparkling','dessert','fortified')),
  price_paid    NUMERIC(10,2),
  estimated_value NUMERIC(10,2),
  supplier      TEXT,
  notes_general TEXT,
  label_image_url TEXT,
  peak_from     SMALLINT,
  peak_until    SMALLINT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- CELLAR ENTRIES
CREATE TABLE cellar_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_id       UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  quantity      SMALLINT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  location      TEXT,
  format        TEXT DEFAULT '750ml' CHECK (format IN ('375ml','750ml','1.5L','3L','6L')),
  acquired_at   DATE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- TASTING NOTES
CREATE TABLE tasting_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_id       UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  tasted_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  occasion      TEXT,
  color_desc    TEXT,
  clarity       TEXT CHECK (clarity IN ('clear','hazy','cloudy')),
  intensity_nose TEXT CHECK (intensity_nose IN ('light','medium','medium+','pronounced')),
  aromas        TEXT[],
  development   TEXT CHECK (development IN ('youthful','developing','fully developed','tired')),
  sweetness     TEXT CHECK (sweetness IN ('dry','off-dry','medium-dry','medium-sweet','sweet','luscious')),
  acidity       TEXT CHECK (acidity IN ('low','medium-','medium','medium+','high')),
  tannin        TEXT CHECK (tannin IN ('low','medium-','medium','medium+','high')),
  body          TEXT CHECK (body IN ('light','medium-','medium','medium+','full')),
  finish        TEXT CHECK (finish IN ('short','medium-','medium','medium+','long')),
  flavors       TEXT[],
  score         SMALLINT CHECK (score BETWEEN 50 AND 100),
  conclusion    TEXT CHECK (conclusion IN ('faulty','poor','acceptable','good','very_good','outstanding')),
  free_text     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- PAIRINGS
CREATE TABLE pairings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_style    TEXT NOT NULL,
  grape_hint    TEXT[],
  food_category TEXT NOT NULL,
  food_name     TEXT NOT NULL,
  match_quality TEXT CHECK (match_quality IN ('classic','good','acceptable','avoid')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- CELLAR TRANSACTIONS
CREATE TABLE cellar_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cellar_entry_id UUID REFERENCES cellar_entries(id) ON DELETE SET NULL,
  wine_id       UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('purchase','consumption','gift_in','gift_out','adjustment')),
  quantity_delta SMALLINT NOT NULL,
  notes         TEXT,
  transaction_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_wines_user      ON wines(user_id);
CREATE INDEX idx_wines_region    ON wines(region);
CREATE INDEX idx_wines_vintage   ON wines(vintage);
CREATE INDEX idx_cellar_wine     ON cellar_entries(wine_id);
CREATE INDEX idx_tastings_wine   ON tasting_notes(wine_id);
CREATE INDEX idx_txn_wine        ON cellar_transactions(wine_id);
