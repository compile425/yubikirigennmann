class CreateEvaluations < ActiveRecord::Migration[7.2]
  def change
    create_table :evaluations do |t|
      t.integer :score
      t.text :comment
      t.text :improvement_plan
      t.bigint :promise_id
      t.bigint :evaluator_id

      t.timestamps
    end
  end
end
