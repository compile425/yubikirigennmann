class CreateNotes < ActiveRecord::Migration[7.2]
  def change
    create_table :notes do |t|
      t.text :content
      t.bigint :partnership_id
      t.bigint :sender_id

      t.timestamps
    end
  end
end
