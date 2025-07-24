class CreatePartnerships < ActiveRecord::Migration[7.2]
  def change
    create_table :partnerships do |t|
      t.string :invite_token
      t.string :status

      t.timestamps
    end
    add_index :partnerships, :invite_token, unique: true
  end
end
