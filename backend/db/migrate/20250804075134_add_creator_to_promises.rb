class AddCreatorToPromises < ActiveRecord::Migration[7.2]
  def change
    add_reference :promises, :creator, null: false, foreign_key: { to_table: :users }
  end
end