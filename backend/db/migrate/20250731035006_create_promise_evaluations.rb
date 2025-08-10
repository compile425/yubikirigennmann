class CreatePromiseEvaluations < ActiveRecord::Migration[7.2]
  def change
    create_table :promise_evaluations do |t|
      t.references :promise, null: false, foreign_key: true
      t.references :evaluator, null: false, foreign_key: { to_table: :users }
      t.integer :rating
      t.text :evaluation_text
      t.timestamps
    end
  end
end
