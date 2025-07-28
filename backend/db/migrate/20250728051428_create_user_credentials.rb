class CreateUserCredentials < ActiveRecord::Migration[7.2]
  def change
    create_table :user_credentials do |t|
      t.string :invite_token, null: false
      t.references :user, null: false, index: true

    
      t.timestamps
    end
    add_index :user_credentials, :invite_token, unique: true
  end
end
