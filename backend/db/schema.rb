# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_07_31_090421) do
  create_table "invitations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "inviter_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["inviter_id"], name: "index_invitations_on_inviter_id"
    t.index ["token"], name: "index_invitations_on_token", unique: true
  end

  create_table "one_words", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "partnership_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["partnership_id"], name: "index_one_words_on_partnership_id"
  end

  create_table "one_words_reads", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "one_word_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["one_word_id"], name: "index_one_words_reads_on_one_word_id"
    t.index ["user_id"], name: "index_one_words_reads_on_user_id"
  end

  create_table "partnerships", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "partner_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["partner_id"], name: "index_partnerships_on_partner_id"
    t.index ["user_id"], name: "index_partnerships_on_user_id"
  end

  create_table "promise_evaluations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "promise_id", null: false
    t.bigint "evaluator_id", null: false
    t.integer "rating"
    t.text "evaluation_text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["evaluator_id"], name: "index_promise_evaluations_on_evaluator_id"
    t.index ["promise_id"], name: "index_promise_evaluations_on_promise_id"
  end

  create_table "promise_histories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "promise_id", null: false
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["promise_id"], name: "index_promise_histories_on_promise_id"
  end

  create_table "promise_rating_scores", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "partnership_id", null: false
    t.date "year_month", null: false
    t.float "average_score"
    t.integer "harvested_apples"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["partnership_id"], name: "index_promise_rating_scores_on_partnership_id"
  end

  create_table "promises", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "partnership_id", null: false
    t.bigint "creator_id", null: false
    t.text "content"
    t.string "status"
    t.string "type"
    t.date "due_date"
    t.integer "promise_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "index_promises_on_creator_id"
    t.index ["partnership_id"], name: "index_promises_on_partnership_id"
  end

  create_table "user_credentials", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "invite_token"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invite_token"], name: "index_user_credentials_on_invite_token", unique: true
    t.index ["user_id"], name: "index_user_credentials_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "invitations", "users", column: "inviter_id"
  add_foreign_key "one_words", "partnerships"
  add_foreign_key "one_words_reads", "one_words"
  add_foreign_key "one_words_reads", "users"
  add_foreign_key "partnerships", "users"
  add_foreign_key "partnerships", "users", column: "partner_id"
  add_foreign_key "promise_evaluations", "promises"
  add_foreign_key "promise_evaluations", "users", column: "evaluator_id"
  add_foreign_key "promise_histories", "promises"
  add_foreign_key "promises", "partnerships"
  add_foreign_key "promises", "users", column: "creator_id"
  add_foreign_key "user_credentials", "users"
end
