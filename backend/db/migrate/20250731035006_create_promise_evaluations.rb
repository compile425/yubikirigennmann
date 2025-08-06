class CreatePromiseEvaluations < ActiveRecord::Migration[7.2]
  def change
    create_table :promise_evaluations do |t|
      t.references :promise, null: false, foreign_key: true
      t.integer :rating
      t.timestamps
    end
  end
end 