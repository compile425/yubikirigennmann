class CreatePromises < ActiveRecord::Migration[7.2]
  def change
    create_table :promises do |t|
      t.references :promise, null: false, index: true
      t.string :type, null: false
      t.text :content, null: false
      t.date :due_date
    
      t.timestamps
    end
  end
end
