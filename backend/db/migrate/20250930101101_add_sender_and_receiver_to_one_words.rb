class AddSenderAndReceiverToOneWords < ActiveRecord::Migration[7.2]
  def change
    add_column :one_words, :sender_id, :bigint, null: false
    add_column :one_words, :receiver_id, :bigint, null: false

    add_index :one_words, :sender_id
    add_index :one_words, :receiver_id

    add_foreign_key :one_words, :users, column: :sender_id
    add_foreign_key :one_words, :users, column: :receiver_id
  end
end
