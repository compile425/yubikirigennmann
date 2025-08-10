class CreateInvitations < ActiveRecord::Migration[7.2]
  def change
    create_table :invitations do |t|
      t.references :inviter, null: false, foreign_key: { to_table: :users }
      t.string :token, null: false
      t.timestamps
    end
    
    add_index :invitations, :token, unique: true
  end
end 