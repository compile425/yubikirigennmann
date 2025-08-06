class RemoveEvaluatorIdIdFromPromiseEvaluations < ActiveRecord::Migration[7.2]
  def change
    remove_column :promise_evaluations, :evaluator_id_id, :bigint
  end
end
