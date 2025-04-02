-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_username VARCHAR(10) UNIQUE NOT NULL CHECK (char_length(telegram_username) >= 3 AND char_length(telegram_username) <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create auth_tokens table
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create plans table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert access for anonymous users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON plans;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for own user" ON users;
DROP POLICY IF EXISTS "Enable all access for own plans" ON plans;
DROP POLICY IF EXISTS "Enable all access for auth tokens" ON auth_tokens;

-- Create new policies for users table
CREATE POLICY "Allow full access to users table"
    ON users
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create new policies for plans table
CREATE POLICY "Allow full access to own plans"
    ON plans
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create new policies for auth_tokens table
CREATE POLICY "Allow full access to auth tokens"
    ON auth_tokens
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true); 