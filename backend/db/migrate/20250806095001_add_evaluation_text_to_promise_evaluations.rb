class AddEvaluationTextToPromiseEvaluations < ActiveRecord::Migration[7.2]
  def change
    add_column :promise_evaluations, :evaluation_text, :text
  end
end
