class AddPasswordDigestToUserCredentials < ActiveRecord::Migration[7.2]
  def change
    add_column :user_credentials, :password_digest, :string
  end
end
