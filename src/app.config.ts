export default defineAppConfig({
  pages: [
    'pages/projects/index',
    'pages/clients/index',
    'pages/quotes/index',
    'pages/materials/index',
    'pages/finance/index',
    'pages/client-detail/index',
    'pages/quote-detail/index',
    'pages/project-detail/index',
    'pages/search/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#8B5CF6',
    navigationBarTitleText: '插画约稿助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F8F7FC'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/projects/index',
        text: '项目'
      },
      {
        pagePath: 'pages/clients/index',
        text: '客户'
      },
      {
        pagePath: 'pages/quotes/index',
        text: '报价'
      },
      {
        pagePath: 'pages/materials/index',
        text: '素材'
      },
      {
        pagePath: 'pages/finance/index',
        text: '收支'
      }
    ]
  }
})
