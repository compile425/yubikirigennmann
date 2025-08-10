class CreatePromises < ActiveRecord::Migration[7.2]
  def change
    create_table :promises do |t|
      t.references :partnership, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.text :content
      t.string :status
      t.string :type
      t.date :due_date
      t.integer :promise_id
      t.timestamps
    end
  end
end
