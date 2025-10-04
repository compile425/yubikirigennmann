class RemoveInviteTokenFromUserCredentials < ActiveRecord::Migration[7.2]
  def change
    remove_column :user_credentials, :invite_token, :string
  end
end
