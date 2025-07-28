class CreatePartnerships < ActiveRecord::Migration[7.2]
  def change
    create_table :partnerships do |t|
      t.references :inviter, null: false, index: true
      t.references :invitee, null: false, index: true
      t.references :invitation, null: false, index: true
    
      t.timestamps
    end
  end
end
