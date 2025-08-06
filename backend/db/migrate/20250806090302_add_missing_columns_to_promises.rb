class AddMissingColumnsToPromises < ActiveRecord::Migration[7.2]
  def change
    add_column :promises, :type, :string
    add_column :promises, :due_date, :date
    add_column :promises, :promise_id, :integer
  end
end
