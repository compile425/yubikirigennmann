class CreateOneWords < ActiveRecord::Migration[7.2]
  def change
    create_table :one_words do |t|
      t.references :partnership, null: false, foreign_key: true
      t.text :content
      t.timestamps
    end
  end
end
