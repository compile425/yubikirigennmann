class CreatePromiseEvaluations < ActiveRecord::Migration[7.2]
  def change
    create_table :promise_evaluations do |t|
      t.references :promise, null: false, index: true
      t.references :user, null: false, index: true
      t.integer :score, null: false
      t.text :comment
      t.text :improvement_plan
      
      t.timestamps
    end
  end
end
