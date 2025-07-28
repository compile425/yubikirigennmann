class CreatePromiseHistories < ActiveRecord::Migration[7.2]
  def change
    create_table :promise_histories do |t|
      t.references :user, null: false, index: true
      t.text :content, null: false
      t.string :type, null: false
      t.date :due_date
      
      t.timestamps
    end
  end
end
