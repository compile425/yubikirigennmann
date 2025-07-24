class CreateMonthlySummaries < ActiveRecord::Migration[7.2]
  def change
    create_table :monthly_summaries do |t|
      t.date :year_month
      t.float :average_score
      t.integer :harvested_apples
      t.bigint :partnership_id

      t.timestamps
    end
  end
end
