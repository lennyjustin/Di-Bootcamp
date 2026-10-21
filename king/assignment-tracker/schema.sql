CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  display_name TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_number TEXT,
  institution TEXT,
  study_level TEXT
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  qualifications TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id),
  teacher_id BIGINT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS courses_teacher_idx ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses(category_id);

CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 5 AND 12000),
  resource_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lessons_course_order_idx ON lessons(course_id, sort_order, id);

CREATE TABLE IF NOT EXISTS enrollments (
  student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  max_score NUMERIC(7, 2) NOT NULL CHECK (max_score > 0 AND max_score <= 100000),
  pass_mark NUMERIC(7, 2) NOT NULL CHECK (pass_mark >= 0 AND pass_mark <= max_score),
  max_attempts INTEGER NOT NULL CHECK (max_attempts BETWEEN 1 AND 10),
  score_policy TEXT NOT NULL DEFAULT 'highest' CHECK (score_policy IN ('highest', 'latest')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS assignments_course_idx ON assignments(course_id);

CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  answer_text TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  score NUMERIC(7, 2),
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
  graded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  UNIQUE (assignment_id, student_id, attempt_number),
  CHECK ((status = 'pending' AND score IS NULL) OR (status != 'pending' AND score IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS submissions_student_idx ON submissions(student_id, assignment_id, attempt_number);
CREATE INDEX IF NOT EXISTS submissions_assignment_idx ON submissions(assignment_id, status, submitted_at);

INSERT INTO categories (name, slug) VALUES
  ('Technology & IT', 'technology-it'),
  ('Business & Finance', 'business-finance'),
  ('Engineering & Construction', 'engineering-construction'),
  ('Health & Life Sciences', 'health-life-sciences'),
  ('Education & Sciences', 'education-sciences'),
  ('Creative & Professional Skills', 'creative-professional-skills')
ON CONFLICT (slug) DO NOTHING;
