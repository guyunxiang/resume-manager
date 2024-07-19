interface TemplateType {
  name: string;
  basicInfo: string[];
  profiles: Array<{
    title: string;
    summary?: string;
    list?: Array<{ title: string; descriptions: string[] }>;
    descriptions?: string[];
  }>;
}

export const RESUME_TEMPLATE: TemplateType = {
  name: '顾云翔（本地模版）',
  basicInfo: ['guyunxiang32@gmail.com', '+1 2345678900', '浙江，杭州'],
  profiles: [
    {
      title: '个人简历',
      summary:
        '经验丰富的前端开发工程师，在使用 HTML5、CSS3、JavaScript（ES6+）以 及 React.js 和 Vue.js 等现代框架创建动态和响应式网络应用程序方面拥有超过 5 年的专业经验。熟练掌握 Node.js、Express.js 和构建 RESTful API。在提高网 站性能、增强用户体验以及在 敏捷/Scrum 环境中有效协作方面能力突出。渴望 利用我丰富的行业经验和技术技能，在前端技领域实现自我突破。',
    },
    {
      title: '工作经历',
      list: [
        {
          title: '浙江省，杭州市，淇澳家居（浙江）有限公司 - 2022.6-2023.7',
          descriptions: [
            '担任IT技术部，高级开发工程师。主要负责杭州技术部门前端开发工作 担任杭州技术部前端',
            'Leader 与香港、澳洲团队协作开发、维护公司网站 负责公司日本站、澳洲站、新西兰站的开发及维护工作',
          ],
        },
        {
          title: '浙江省，杭州市，杭州远境互联科技有限公司 - 2018.4-2022.3',
          descriptions: [
            '担任技术部，高级前端开发工程师，主要负责公司前端开发工作',
            '主导公司核心前端项目架构升级及开发维护工作',
            '负责公司主要前端项目开发，功能迭代优化及维护工作',
            '负责微信 h5 活动开发',
            '负责开发过多个区块链 dapp 项目，ethereume 智能合约开发',
          ],
        },
        {
          title: '浙江省，杭州市，杭州雍享网络科技有限公司 - 2017.3-2018.4',
          descriptions: [
            '担任技术部，高级前端工程师，主要负责公司前端开发工作',
            '负责公司官网前端开发及功能迭代维护工作',
          ],
        },
        {
          title: '浙江省，杭州市，杭州博彦信息技术有限公司 - 2016.5-2017.3',
          descriptions: [
            '担任电商业务部，前端开发工程师，主要负责阿里巴巴集团前端开发工作',
            '办公于杭州阿里巴巴集团，阿里妈妈事业部，采购平台，负责采购系统前端开发',
            '及维护工作',
            '参与 react 框架 uxcore 的组件开发及维护',
          ],
        },
      ],
    },
    {
      title: '教育背景',
      descriptions: [
        '加拿大，安大略省，滑铁卢，康尼斯托加学院 - Web Development, Post - Graduate, 2023-now',
        '天津市，南开区，南开大学 — 计算机科学与技术，本科，2017-2020',
        '安徽省，合肥市，安徽职业技术学院 — 软件技术，专科，2011-2014',
      ],
    },
    {
      title: '专业技能',
      descriptions: [
        '熟练掌握 JavaScript/CSS/HTML 前端技术，理解HTTP及相关协议，熟悉浏览器和移动平台特性，了解行业技术发展',
        '熟练掌握 React.js、Vue.js 前端框架，具有丰富的项目开发经验',
        '熟练掌握 less、sass、scss 等动态样式语言',
        '熟悉 Bootstrap、Material-UI 等前端框架，熟悉响应式开发',
        '熟悉 node.js、PHP 非前端语言，具有一定项目实战经验。',
        '熟悉 Web3、智能合约、dapp开发等多种区块链新兴技术应用，具有一定项目实战经验',
      ],
    },
  ],
};

export const MINIMUM_RESUME_TEMPLATE: { [key: string]: TemplateType } = {
  en: {
    name: 'First Name Last Name',
    basicInfo: ['hr@arcblock.io'],
    profiles: [
      {
        title: 'Summary',
        summary:
          'I am a dedicated and driven individual with a strong passion for [your field or industry]. With a solid background in [relevant experience or education], I bring [specific skills or expertise] to any team I work with. My journey in [field/industry] has equipped me with a keen [quality/skill], allowing me to [accomplishment or ability].',
      },
      {
        title: 'Work Experience',
        list: [
          {
            title: "Company's Name, Job Title, Date",
            descriptions: [
              'Develop and execute comprehensive marketing strategies to drive brand awareness and lead generation, resulting in a 30% increase in customer acquisition.',
            ],
          },
        ],
      },
      {
        title: 'Education',
        descriptions: ["University of Oxford, Master's degree, 2020"],
      },
    ],
  },
  zh: {
    name: '姓名',
    basicInfo: ['hr@arcblock.io'],
    profiles: [
      {
        title: '个人简介',
        summary:
          '我是一个敬业、有干劲的人，对[您的领域或行业]有着强烈的热情。凭借扎实的[相关经验或教育]背景，我可以为任何团队带来[特定技能或专业知识]。在[领域/行业]的历练让我具备了敏锐的[素质/技能]，使我能够[取得成就或能力]。',
      },
      {
        title: '工作经历',
        list: [
          {
            title: '公司名称，工作岗位，任职时间',
            descriptions: ['制定并执行全面的营销战略，提高品牌知名度并创造销售线索，使客户获取率提高 30%。'],
          },
        ],
      },
      {
        title: '教育背景',
        descriptions: ['牛津大学，硕士学位，2020'],
      },
    ],
  },
};
