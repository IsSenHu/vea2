const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  id: state => state.user.id,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  selfSettings: state => state.user.selfSettings,
  businessSettings: state => state.user.businessSettings,
  justLogin: state => state.user.justLogin,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  clientId: state => 'IACAA'
}

export default getters

