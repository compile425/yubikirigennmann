class CreatePromiseHistories < ActiveRecord::Migration[7.2]
  def change
    create_table :promise_histories do |t|
      t.references :promise, null: false, foreign_key: true
      t.string :status
      t.timestamps
    end
  end
end 