class CreateInvitations < ActiveRecord::Migration[7.2]
  def change
    create_table :invitations do |t|
      t.references :partnership, null: false, foreign_key: true
      t.timestamps
    end
  end
end 