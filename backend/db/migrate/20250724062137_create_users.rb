class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :email
      t.string :password_digest
      t.string :name
      t.string :profile_image_url
      t.bigint :partnership_id

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
