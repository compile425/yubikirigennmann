class CreatePromises < ActiveRecord::Migration[7.2]
  def change
    create_table :promises do |t|
      t.text :content
      t.string :promise_type
      t.date :due_date
      t.bigint :partnership_id
      t.bigint :creator_id

      t.timestamps
    end
  end
end
