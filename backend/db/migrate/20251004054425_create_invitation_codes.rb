class CreateInvitationCodes < ActiveRecord::Migration[7.2]
  def change
    create_table :invitation_codes do |t|
      t.references :inviter, null: false, foreign_key: { to_table: :users }
      t.string :code, null: false, limit: 8
      t.boolean :used, default: false
      t.timestamps
    end

    add_index :invitation_codes, :code, unique: true
    add_index :invitation_codes, :inviter_id, name: 'idx_invitation_codes_inviter'
  end
end