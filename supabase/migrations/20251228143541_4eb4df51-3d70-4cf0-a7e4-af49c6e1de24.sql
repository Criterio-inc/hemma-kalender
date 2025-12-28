-- Performance Optimization Migration
-- Add indexes for frequently queried columns

-- Events table - most queried
CREATE INDEX IF NOT EXISTS idx_events_household_date
ON events(household_code, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_events_category
ON events(event_category)
WHERE event_type = 'major_event';

CREATE INDEX IF NOT EXISTS idx_events_recurring
ON events(household_code, recurring)
WHERE recurring = true;

-- Todos table
CREATE INDEX IF NOT EXISTS idx_todos_household_incomplete
ON todos(household_code, due_date)
WHERE completed = false;

CREATE INDEX IF NOT EXISTS idx_todos_event
ON todos(event_id, completed);

CREATE INDEX IF NOT EXISTS idx_todos_priority
ON todos(household_code, priority, due_date)
WHERE completed = false;

-- Recipes table
CREATE INDEX IF NOT EXISTS idx_recipes_household_created
ON recipes(household_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recipes_tags_gin
ON recipes USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_recipes_category
ON recipes(household_code, category);

-- Notes table
CREATE INDEX IF NOT EXISTS idx_notes_event
ON notes(event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_tags_gin
ON notes USING GIN(tags);

-- Shopping lists
CREATE INDEX IF NOT EXISTS idx_shopping_lists_household
ON shopping_lists(household_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shopping_items_list
ON shopping_list_items(shopping_list_id, checked);

-- AI interactions (for analytics)
CREATE INDEX IF NOT EXISTS idx_ai_interactions_household
ON ai_interactions(household_code, created_at DESC);

-- Notifications (using household_code since user_id doesn't exist)
CREATE INDEX IF NOT EXISTS idx_notifications_household_unread
ON notifications(household_code, read, scheduled_for)
WHERE sent = true;

-- Event timeline
CREATE INDEX IF NOT EXISTS idx_timeline_event
ON event_timeline(event_id, sort_order);

-- Event recipes
CREATE INDEX IF NOT EXISTS idx_event_recipes_event
ON event_recipes(event_id);

CREATE INDEX IF NOT EXISTS idx_event_recipes_recipe
ON event_recipes(recipe_id);

-- Images
CREATE INDEX IF NOT EXISTS idx_images_event
ON images(event_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_images_recipe
ON images(recipe_id);

-- Guests
CREATE INDEX IF NOT EXISTS idx_guests_event
ON guests(event_id, rsvp_status);

-- Budget items
CREATE INDEX IF NOT EXISTS idx_budget_items_budget
ON budget_items(budget_id, category);

-- Meal plans
CREATE INDEX IF NOT EXISTS idx_meal_plans_household_week
ON meal_plans(household_code, week_start_date DESC);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan
ON meal_plan_items(meal_plan_id, day_of_week);

-- Data validation constraints
-- Using DO block to handle existing constraints gracefully
DO $$
BEGIN
  -- Events constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_event_dates') THEN
    ALTER TABLE events ADD CONSTRAINT check_event_dates
    CHECK (end_date IS NULL OR end_date >= start_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_event_type') THEN
    ALTER TABLE events ADD CONSTRAINT check_event_type
    CHECK (event_type IN ('simple', 'major_event'));
  END IF;

  -- Todos constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_todo_priority') THEN
    ALTER TABLE todos ADD CONSTRAINT check_todo_priority
    CHECK (priority IN ('low', 'medium', 'high'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_todo_category') THEN
    ALTER TABLE todos ADD CONSTRAINT check_todo_category
    CHECK (category IN ('shopping', 'cooking', 'decoration', 'general'));
  END IF;

  -- Recipes constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_recipe_times') THEN
    ALTER TABLE recipes ADD CONSTRAINT check_recipe_times
    CHECK ((prep_time IS NULL OR prep_time >= 0) AND (cook_time IS NULL OR cook_time >= 0));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_recipe_servings') THEN
    ALTER TABLE recipes ADD CONSTRAINT check_recipe_servings
    CHECK (servings IS NULL OR servings > 0);
  END IF;
END $$;

-- Add foreign key constraints for household_code consistency
-- Using DO block to handle existing constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_events_household') THEN
    ALTER TABLE events ADD CONSTRAINT fk_events_household
    FOREIGN KEY (household_code) REFERENCES households(household_code) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_todos_household') THEN
    ALTER TABLE todos ADD CONSTRAINT fk_todos_household
    FOREIGN KEY (household_code) REFERENCES households(household_code) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_recipes_household') THEN
    ALTER TABLE recipes ADD CONSTRAINT fk_recipes_household
    FOREIGN KEY (household_code) REFERENCES households(household_code) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_household') THEN
    ALTER TABLE notes ADD CONSTRAINT fk_notes_household
    FOREIGN KEY (household_code) REFERENCES households(household_code) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_shopping_lists_household') THEN
    ALTER TABLE shopping_lists ADD CONSTRAINT fk_shopping_lists_household
    FOREIGN KEY (household_code) REFERENCES households(household_code) ON DELETE CASCADE;
  END IF;
END $$;