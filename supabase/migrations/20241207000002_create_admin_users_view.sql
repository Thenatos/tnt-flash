-- Criar uma view para facilitar a busca de admins com email
CREATE OR REPLACE VIEW admin_users_with_email AS
SELECT 
  ur.user_id,
  ur.role,
  p.full_name,
  au.email
FROM user_roles ur
INNER JOIN profiles p ON p.user_id = ur.user_id
INNER JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin';

-- Dar permissão para a view
GRANT SELECT ON admin_users_with_email TO authenticated;
