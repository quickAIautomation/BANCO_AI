// Utilitário para verificar permissões do usuário

export const hasPermission = (userRole, permission) => {
  if (!userRole) return false
  
  switch (permission) {
    case 'CREATE_CARRO':
    case 'CREATE_EMPRESA':
      return userRole === 'ADMIN' || userRole === 'OPERADOR'
    
    case 'EDIT_CARRO':
    case 'EDIT_EMPRESA':
      return userRole === 'ADMIN' || userRole === 'OPERADOR'
    
    case 'DELETE_CARRO':
    case 'DELETE_EMPRESA':
    case 'MANAGE_EMPRESAS':
    case 'MANAGE_USUARIOS':
      return userRole === 'ADMIN'
    
    case 'VIEW':
      return true // Todos podem ver
    
    default:
      return false
  }
}

export const canCreateCarro = (userRole) => hasPermission(userRole, 'CREATE_CARRO')
export const canEditCarro = (userRole) => hasPermission(userRole, 'EDIT_CARRO')
export const canDeleteCarro = (userRole) => hasPermission(userRole, 'DELETE_CARRO')

export const canCreateEmpresa = (userRole) => hasPermission(userRole, 'CREATE_EMPRESA')
export const canEditEmpresa = (userRole) => hasPermission(userRole, 'EDIT_EMPRESA')
export const canDeleteEmpresa = (userRole) => hasPermission(userRole, 'DELETE_EMPRESA')
export const canManageEmpresas = (userRole) => hasPermission(userRole, 'MANAGE_EMPRESAS')
export const canManageUsuarios = (userRole) => hasPermission(userRole, 'MANAGE_USUARIOS')

