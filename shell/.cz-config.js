module.exports = {
  types: [
    {value: 'feat',      name: 'feat:     新功能'},
    {value: 'fix',       name: 'fix:      缺陷修复'},
    {value: 'refactor',  name: 'refactor: 重构'},
    {value: 'style',     name: 'style:    代码格式优化（不影响代码运行的变动）'},
    {value: 'chore',     name: 'chore:    工程化（构建过程或辅助工具的变动）'},
    {value: 'perf',      name: 'perf:     性能优化（提升性能的代码变动）'},
    {value: 'docs',      name: 'docs:     文档相关修改'},
    {value: 'test',      name: 'test:     测试（增加测试）'},
    {value: 'revert',    name: 'revert:   回滚'},
    {value: 'WIP',       name: 'WIP:      正在进行中的改动'}
  ],

  scopes: [
    {name: 'project'},
    {name: 'application'},
    {name: 'org'},
  ],

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: '#',
  ticketNumberRegExp: '\\d{0,9}',

  /*
  scopeOverrides: {
    fix: [
      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */

  messages: {
    type: '选择你要 Commit 的变更类型：',
    scope: '选择或自定义你的变更范围【可选】：',
    customScope: '输入变更范围：',
    subject: '填写标题：\n',
    body: '填写内容，用 "|" 来分行【可选】:\n',
    breaking: '列出不兼容的变更【可选】:\n',
    footer: '列出你要关闭的 Issue ID【可选】，例如：#31, #34：\n',
    confirmCommit: '确认上面的 Commit 信息？'
  },
  
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  skipQuestions: ['breaking'],
  subjectLimit: 100
};
