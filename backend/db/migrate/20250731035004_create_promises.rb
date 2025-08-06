class CreatePromises < ActiveRecord::Migration[7.2]
  def change
    create_table :promises do |t|
      t.references :partnership, null: false, foreign_key: true
      t.text :content
      t.string :status
      t.timestamps
    end
  end
end 