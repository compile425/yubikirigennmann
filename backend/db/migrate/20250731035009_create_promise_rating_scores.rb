class CreatePromiseRatingScores < ActiveRecord::Migration[7.2]
    def change
      create_table :promise_rating_scores do |t|
        t.references :partnership, null: false, index: true
        t.date :year_month, null: false
        t.float :average_score
        t.integer :harvested_apples
        t.timestamps
      end
    end
end
