class CreateOneWordsReads < ActiveRecord::Migration[7.2]
  def change
    create_table :one_words_reads do |t|
      t.references :one_word, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
  end
end 