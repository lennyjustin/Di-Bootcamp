-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "google_sub" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "password_change_required" BOOLEAN NOT NULL DEFAULT false,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "permission_overrides" TEXT,
    "member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "phone" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "citizenship" TEXT NOT NULL,
    "identification_type" TEXT NOT NULL,
    "identification_number" TEXT NOT NULL,
    "kra_pin" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "membership_type" TEXT NOT NULL,
    "common_bond_details" TEXT,
    "next_of_kin_name" TEXT NOT NULL,
    "next_of_kin_relationship" TEXT NOT NULL,
    "next_of_kin_phone" TEXT NOT NULL,
    "employment_status" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "employer_name" TEXT,
    "monthly_income" BIGINT NOT NULL,
    "application_statement" TEXT NOT NULL,
    "passport_file" TEXT NOT NULL,
    "kra_pin_file" TEXT NOT NULL,
    "identification_file" TEXT NOT NULL,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_name" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status_code" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "member_no" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "national_id" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_accounts" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "account_no" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "minimum_balance" BIGINT NOT NULL DEFAULT 0,
    "interest_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "loan_no" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "principal" BIGINT NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "term_months" INTEGER NOT NULL,
    "total_interest" BIGINT NOT NULL DEFAULT 0,
    "total_repayable" BIGINT NOT NULL DEFAULT 0,
    "outstanding_balance" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ai_risk_score" DOUBLE PRECISION,
    "ai_risk_level" TEXT,
    "ai_decision_note" TEXT,
    "application_note" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT,
    "disbursed_at" TIMESTAMP(3),

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_repayments" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "reference" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_repayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shares" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "value_per_share" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "member_id" TEXT,
    "savings_account_id" TEXT,
    "loan_id" TEXT,
    "type" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "balance_after" BIGINT,
    "channel" TEXT NOT NULL DEFAULT 'cash',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "description" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mpesa_transactions" (
    "id" TEXT NOT NULL,
    "member_id" TEXT,
    "account_id" TEXT,
    "loan_id" TEXT,
    "purpose" TEXT NOT NULL DEFAULT 'legacy',
    "checkout_request_id" TEXT,
    "merchant_request_id" TEXT,
    "receipt_number" TEXT,
    "phone_number" TEXT,
    "amount" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result_code" INTEGER,
    "result_description" TEXT,
    "callback_payload" TEXT,
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mpesa_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_sub_key" ON "users"("google_sub");

-- CreateIndex
CREATE UNIQUE INDEX "users_member_id_key" ON "users"("member_id");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_user_id_key" ON "membership_applications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_phone_key" ON "membership_applications"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_identification_number_key" ON "membership_applications"("identification_number");

-- CreateIndex
CREATE INDEX "membership_applications_status_created_at_idx" ON "membership_applications"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_expires_at_idx" ON "password_reset_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");

-- CreateIndex
CREATE INDEX "audit_events_actor_user_id_created_at_idx" ON "audit_events"("actor_user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "members_member_no_key" ON "members"("member_no");

-- CreateIndex
CREATE UNIQUE INDEX "members_phone_key" ON "members"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "members_national_id_key" ON "members"("national_id");

-- CreateIndex
CREATE INDEX "members_full_name_idx" ON "members"("full_name");

-- CreateIndex
CREATE UNIQUE INDEX "savings_accounts_account_no_key" ON "savings_accounts"("account_no");

-- CreateIndex
CREATE INDEX "savings_accounts_member_id_idx" ON "savings_accounts"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "loans_loan_no_key" ON "loans"("loan_no");

-- CreateIndex
CREATE INDEX "loans_member_id_status_idx" ON "loans"("member_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "loan_repayments_reference_key" ON "loan_repayments"("reference");

-- CreateIndex
CREATE INDEX "loan_repayments_loan_id_paid_at_idx" ON "loan_repayments"("loan_id", "paid_at");

-- CreateIndex
CREATE INDEX "shares_member_id_idx" ON "shares"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE INDEX "transactions_member_id_created_at_idx" ON "transactions"("member_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_transactions_checkout_request_id_key" ON "mpesa_transactions"("checkout_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_transactions_receipt_number_key" ON "mpesa_transactions"("receipt_number");

-- CreateIndex
CREATE INDEX "mpesa_transactions_member_id_created_at_idx" ON "mpesa_transactions"("member_id", "created_at");

-- CreateIndex
CREATE INDEX "mpesa_transactions_status_created_at_idx" ON "mpesa_transactions"("status", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_savings_account_id_fkey" FOREIGN KEY ("savings_account_id") REFERENCES "savings_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mpesa_transactions" ADD CONSTRAINT "mpesa_transactions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mpesa_transactions" ADD CONSTRAINT "mpesa_transactions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
