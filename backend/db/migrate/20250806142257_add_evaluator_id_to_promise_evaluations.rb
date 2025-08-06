class AddEvaluatorIdToPromiseEvaluations < ActiveRecord::Migration[7.2]
  def change
    add_reference :promise_evaluations, :evaluator, null: false, foreign_key: { to_table: :users }
  end
end
