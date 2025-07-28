class CreateInvitations < ActiveRecord::Migration[7.2]
  def change
    create_table :invitations do |t|
      t.references :partnership, null: false, index: true

    
      t.timestamps
    end
  end
end
