json.user do
  json.id @current_user.id
  json.name @current_user.name
  json.email @current_user.email
end

if @partner
  json.partner do
    json.id @partner.id
    json.name @partner.name
    json.email @partner.email
  end
end