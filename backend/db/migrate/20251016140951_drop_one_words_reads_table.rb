class DropOneWordsReadsTable < ActiveRecord::Migration[7.2]
  def change
    drop_table :one_words_reads do |t|
      t.references :one_word, null: false, foreign_key: true
      t.references :reader, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end
