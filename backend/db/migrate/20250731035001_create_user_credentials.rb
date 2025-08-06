class CreateUserCredentials < ActiveRecord::Migration[7.2]
  def change
    create_table :user_credentials do |t|
      t.references :user, null: false, foreign_key: true
      t.string :invite_token
      t.timestamps
    end
    
    add_index :user_credentials, :invite_token, unique: true
  end
end 