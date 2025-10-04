class DropInvitationsTable < ActiveRecord::Migration[7.2]
  def change
    drop_table :invitations do |t|
      t.references :inviter, null: false, foreign_key: { to_table: :users }
      t.string :token, null: false
      t.timestamps
    end
  end
end
