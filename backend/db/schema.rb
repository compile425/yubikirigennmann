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

ActiveRecord::Schema[7.2].define(version: 2025_07_28_052737) do
  create_table "invitations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "partnership_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["partnership_id"], name: "index_invitations_on_partnership_id"
  end

  create_table "one_words", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "partnership_id", null: false
    t.bigint "user_id", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["partnership_id"], name: "index_one_words_on_partnership_id"
    t.index ["user_id"], name: "index_one_words_on_user_id"
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
    t.bigint "inviter_id", null: false
    t.bigint "invitee_id", null: false
    t.bigint "invitation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invitation_id"], name: "index_partnerships_on_invitation_id"
    t.index ["invitee_id"], name: "index_partnerships_on_invitee_id"
    t.index ["inviter_id"], name: "index_partnerships_on_inviter_id"
  end

  create_table "promise_evaluations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "promise_id", null: false
    t.bigint "user_id", null: false
    t.integer "score", null: false
    t.text "comment"
    t.text "improvement_plan"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["promise_id"], name: "index_promise_evaluations_on_promise_id"
    t.index ["user_id"], name: "index_promise_evaluations_on_user_id"
  end

  create_table "promise_histories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "content", null: false
    t.string "type", null: false
    t.date "due_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_promise_histories_on_user_id"
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
    t.bigint "promise_id", null: false
    t.string "type", null: false
    t.text "content", null: false
    t.date "due_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["promise_id"], name: "index_promises_on_promise_id"
  end

  create_table "user_credentials", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "invite_token", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invite_token"], name: "index_user_credentials_on_invite_token", unique: true
    t.index ["user_id"], name: "index_user_credentials_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "email", null: false
    t.string "name", null: false
    t.string "profile_image_url"
    t.bigint "partnership_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["partnership_id"], name: "index_users_on_partnership_id"
  end

  add_foreign_key "invitations", "partnerships"
  add_foreign_key "one_words", "partnerships"
  add_foreign_key "one_words", "users"
  add_foreign_key "one_words_reads", "one_words"
  add_foreign_key "one_words_reads", "users"
  add_foreign_key "partnerships", "invitations"
  add_foreign_key "partnerships", "users", column: "invitee_id"
  add_foreign_key "partnerships", "users", column: "inviter_id"
  add_foreign_key "promise_evaluations", "promises"
  add_foreign_key "promise_evaluations", "users"
  add_foreign_key "promise_histories", "users"
  add_foreign_key "promise_rating_scores", "partnerships"
  add_foreign_key "promises", "promises"
  add_foreign_key "user_credentials", "users"
  add_foreign_key "users", "partnerships"
end
