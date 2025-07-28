class AddForeignKeysToTables < ActiveRecord::Migration[7.1]
  def change
    # usersテーブル
    add_foreign_key :users, :partnerships

    # user_credentialsテーブル
    add_foreign_key :user_credentials, :users

    # partnershipsテーブル
    add_foreign_key :partnerships, :users, column: :inviter_id
    add_foreign_key :partnerships, :users, column: :invitee_id
    add_foreign_key :partnerships, :invitations

    # invitationsテーブル
    add_foreign_key :invitations, :partnerships

    # promisesテーブル
    add_foreign_key :promises, :promises # 自己参照
    
    # promise_historiesテーブル
    add_foreign_key :promise_histories, :users

    # promise_evaluationsテーブル
    add_foreign_key :promise_evaluations, :promises
    add_foreign_key :promise_evaluations, :users

    # one_wordsテーブル
    add_foreign_key :one_words, :partnerships
    add_foreign_key :one_words, :users

    # one_words_readsテーブル
    add_foreign_key :one_words_reads, :one_words
    add_foreign_key :one_words_reads, :users

    # promise_evaluation_monthly_summariesテーブル
    add_foreign_key :promise_evaluation_monthly_summaries, :partnerships
  end
end