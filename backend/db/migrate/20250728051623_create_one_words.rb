class CreateOneWords < ActiveRecord::Migration[7.2]
  def change
    create_table :one_words do |t|
      t.references :partnership, null: false, index: true
      t.references :user, null: false, index: true
      t.text :content, null: false
      
      t.timestamps
    end
  end
end
