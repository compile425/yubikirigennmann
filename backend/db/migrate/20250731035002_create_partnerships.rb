class CreatePartnerships < ActiveRecord::Migration[7.2]
  def change
    create_table :partnerships do |t|
      t.references :user, null: false, foreign_key: { to_table: :users }
      t.references :partner, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end 