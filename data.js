/* ========================================================
 *  集体备课 · 模拟数据
 * ======================================================== */

window.MOCK_DATA = {
  currentUser: { id: "u1", name: "冯佳华", avatar: "冯" },

  // 学校及校区数据
  schools: [
    { id: "s1", name: "产品演示学校", campuses: ["演示校区", "东校区", "西校区"] },
    { id: "s2", name: "第一实验中学", campuses: ["本部", "南校区"] },
    { id: "s3", name: "第二中学", campuses: ["主校区"] }
  ],

  // 教学计划数据
  teachingPlans: [
    { id: "p1", name: "初中语文2026下学期教研计划~", status: "进行中" },
    { id: "p2", name: "初中语文2026上学期教研计划", status: "已结束" },
    { id: "p3", name: "初中语文2027学年教研计划", status: "未开始" }
  ],

  teachers: [
    { id: "u1", name: "冯佳华", avatar: "冯", isMe: true },
    { id: "u2", name: "李明",   avatar: "李", isMe: false },
    { id: "u3", name: "王芳",   avatar: "王", isMe: false },
    { id: "u4", name: "张丽",   avatar: "张", isMe: false }
  ],

  resourceTypes: ["教案", "课件", "学案", "音视频", "试卷", "作业", "素材"],

  groups: [
    { id: "g1", name: "一年级英语备课", subject: "英语", grade: "一年级", hostName: "冯佳华", hostId: "u1", members: 8, progress: 32 },
    { id: "g2", name: "二年级数学备课", subject: "数学", grade: "二年级", hostName: "李明",   hostId: "u2", members: 6, progress: 58 },
    { id: "g3", name: "三年级语文备课", subject: "语文", grade: "三年级", hostName: "王芳",   hostId: "u3", members: 10, progress: 74 },
    { id: "g4", name: "四年级科学备课", subject: "科学", grade: "四年级", hostName: "张伟",   hostId: "u4", members: 5, progress: 20 }
  ],

  trees: {
    g1: [
      {
        id: "w1", label: "第一周", type: "week", status: ["集","个"], children: [
          {
            id: "u1", label: "Unit 1 Helping at home", type: "unit", status: ["集","个"], children: [
              { id: "u1-p1", label: "Part A · 听读", type: "part", status: ["集","个","思"] },
              { id: "u1-p2", label: "Part B · 对话", type: "part", status: ["集","个"] },
              { id: "u1-p3", label: "Part C · 故事", type: "part", status: ["集"] },
              { id: "u1-r",  label: "本单元复习与测试", type: "review", status: ["个"] }
            ]
          },
          {
            id: "ch1", label: "Chapter 1 Starting the day", type: "chapter", status: ["集","个"], children: [
              { id: "ch1-l1", label: "Lesson 1", type: "lesson", status: ["集","个","思"] },
              { id: "ch1-f1", label: "Fun time", type: "funtime", status: ["集","个"] }
            ]
          }
        ]
      },
      {
        id: "w2", label: "第二周", type: "week", status: ["个"], children: [
          {
            id: "ch2", label: "Chapter 2 Nice to meet you", type: "chapter", status: ["集"], children: [
              { id: "ch2-l1", label: "Lesson 3", type: "lesson", status: ["个","思"] },
              { id: "ch2-l2", label: "Lesson 4", type: "lesson", status: ["思"] }
            ]
          },
          {
            id: "ch3", label: "Chapter 3 My toys", type: "chapter", status: ["集","个"], children: [
              { id: "ch3-l1", label: "Lesson 5", type: "lesson", status: ["集"] },
              { id: "ch3-l2", label: "Lesson 6", type: "lesson", status: ["集","个","思"] }
            ]
          }
        ]
      },
      {
        id: "w3", label: "第三周", type: "week", status: ["思"], children: [
          { id: "w3-pa", label: "Part A · 词汇", type: "part", status: ["集","个"] },
          { id: "w3-pb", label: "Part B · 语法", type: "part", status: ["个","思"] },
          { id: "w3-pc", label: "Part C · 写作", type: "part", status: ["集"] },
          { id: "w3-r",  label: "本单元复习与测试", type: "review", status: ["集","个","思"] }
        ]
      },
      {
        id: "w4", label: "第四周", type: "week", status: ["集","个","思"], children: [
          {
            id: "u2", label: "Unit 2 Making friends", type: "unit", status: ["集"], children: [
              { id: "u2-p1", label: "Part A", type: "part", status: ["集","个"] },
              { id: "u2-p2", label: "Part B", type: "part", status: ["个","思"] },
              { id: "u2-p3", label: "Part C", type: "part", status: ["集"] },
              { id: "u2-r",  label: "本单元复习与测试", type: "review", status: ["集","个","思"] }
            ]
          }
        ]
      }
    ],
    g2: [
      { id: "gw2-1", label: "第一周 · 长度单位", type: "week", status: ["集","个"] },
      { id: "gw2-2", label: "第二周 · 100以内加减法", type: "week", status: ["个"] },
      { id: "gw2-3", label: "第三周 · 角的初步认识", type: "week", status: ["思"] }
    ],
    g3: [
      { id: "gw3-1", label: "第一单元 · 小蝌蚪找妈妈", type: "week", status: ["集","个","思"] },
      { id: "gw3-2", label: "第二单元 · 黄山奇石",     type: "week", status: ["集","个"] }
    ],
    g4: [
      { id: "gw4-1", label: "第一单元 · 植物", type: "week", status: ["集","个"] },
      { id: "gw4-2", label: "第二单元 · 动物", type: "week", status: ["思"] }
    ]
  },

  resources: {
    "u1-p1": {
      hostName: "冯佳华",
      hostId: "u1",
      group: [
        { id: "r1", name: "Unit 1 Part A 教学设计.docx", type: "doc", tag: "教案", size: "1.8 MB" },
        { id: "r2", name: "Unit 1 Part A 课堂PPT.pptx",   type: "ppt", tag: "课件", size: "5.6 MB" },
        { id: "r3", name: "Unit 1 Part A 音频素材.mp3",   type: "audio", tag: "素材", size: "2.1 MB" }
      ],
      personal: {
        u1: [
          { id: "pr1", name: "冯佳华 - 个人教案.docx", type: "doc", tag: "教案", size: "2.0 MB" },
          { id: "pr2", name: "冯佳华 - 教学反思.pdf",  type: "pdf", tag: "反思", size: "0.6 MB" }
        ],
        u2: [
          { id: "pr3", name: "李明 - 课堂设计.docx", type: "doc", tag: "教案", size: "1.4 MB" }
        ],
        u3: [],
        u4: []
      }
    },
    "ch1-l1": {
      hostName: "冯佳华",
      hostId: "u1",
      group: [
        { id: "r1", name: "Lesson 1 教学设计.docx", type: "doc", tag: "教案", size: "1.5 MB" },
        { id: "r2", name: "Lesson 1 活动单.docx",   type: "doc", tag: "活动", size: "0.9 MB" }
      ],
      personal: {
        u1: [{ id: "pr1", name: "Lesson 1 个人教案.docx", type: "doc", tag: "教案", size: "1.4 MB" }],
        u2: [],
        u3: [],
        u4: []
      }
    },
    default: {
      hostName: "冯佳华",
      hostId: "u1",
      group: [
        { id: "d1", name: "参考教案模板.docx", type: "doc", tag: "教案", size: "1.5 MB" }
      ],
      personal: {
        u1: [{ id: "pd1", name: "个人备课基础文档.docx", type: "doc", tag: "教案", size: "1.3 MB" }],
        u2: [],
        u3: [],
        u4: []
      }
    }
  }
};