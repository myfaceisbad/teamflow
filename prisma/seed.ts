import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.resolve('./prisma/dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Departments
  const dept1 = await prisma.department.create({ data: { name: '開発部' } })
  const dept2 = await prisma.department.create({ data: { name: 'マーケティング部' } })

  // Users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@teamflow.dev',
      name: '田中 太郎',
      password: hashedPassword,
      role: 'ADMIN',
      departmentId: dept1.id,
      capacityHours: 40,
    }
  })

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@teamflow.dev',
      name: '鈴木 花子',
      password: hashedPassword,
      role: 'MANAGER',
      departmentId: dept1.id,
      capacityHours: 40,
    }
  })

  const member1 = await prisma.user.create({
    data: {
      email: 'member1@teamflow.dev',
      name: '佐藤 健',
      password: hashedPassword,
      role: 'MEMBER',
      departmentId: dept1.id,
      capacityHours: 40,
    }
  })

  const member2 = await prisma.user.create({
    data: {
      email: 'member2@teamflow.dev',
      name: '山田 美咲',
      password: hashedPassword,
      role: 'MEMBER',
      departmentId: dept2.id,
      capacityHours: 32,
    }
  })

  const member3 = await prisma.user.create({
    data: {
      email: 'member3@teamflow.dev',
      name: '伊藤 拓也',
      password: hashedPassword,
      role: 'MEMBER',
      departmentId: dept1.id,
      capacityHours: 40,
    }
  })

  // Skills
  await prisma.userSkill.createMany({
    data: [
      { userId: member1.id, skillName: 'React', category: 'technical', level: 4 },
      { userId: member1.id, skillName: 'TypeScript', category: 'technical', level: 4 },
      { userId: member1.id, skillName: 'Node.js', category: 'technical', level: 3 },
      { userId: member1.id, skillName: 'Python', category: 'technical', level: 2, isGrowthTarget: true },
      { userId: member2.id, skillName: 'React', category: 'technical', level: 3 },
      { userId: member2.id, skillName: 'UI/UXデザイン', category: 'business', level: 5 },
      { userId: member2.id, skillName: 'Figma', category: 'technical', level: 4 },
      { userId: member2.id, skillName: 'TypeScript', category: 'technical', level: 2, isGrowthTarget: true },
      { userId: member3.id, skillName: 'Python', category: 'technical', level: 5 },
      { userId: member3.id, skillName: 'データ分析', category: 'business', level: 4 },
      { userId: member3.id, skillName: 'SQL', category: 'technical', level: 4 },
      { userId: member3.id, skillName: 'React', category: 'technical', level: 2, isGrowthTarget: true },
      { userId: manager1.id, skillName: 'プロジェクト管理', category: 'business', level: 5 },
      { userId: manager1.id, skillName: 'React', category: 'technical', level: 3 },
    ]
  })

  // Team
  const team1 = await prisma.team.create({
    data: { name: '開発チームA', departmentId: dept1.id }
  })

  // Projects
  const project1 = await prisma.project.create({
    data: {
      name: '社内ポータルリニューアル',
      description: '社内ポータルサイトのUI/UXを全面的にリニューアルするプロジェクト',
      status: 'ACTIVE',
      color: '#6366f1',
      teamId: team1.id,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-06-30'),
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'データ分析基盤構築',
      description: '売上データの可視化ダッシュボードを構築するプロジェクト',
      status: 'ACTIVE',
      color: '#10b981',
      teamId: team1.id,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-08-31'),
    }
  })

  // Project Members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: admin.id, role: 'OWNER' },
      { projectId: project1.id, userId: manager1.id, role: 'MANAGER' },
      { projectId: project1.id, userId: member1.id, role: 'MEMBER' },
      { projectId: project1.id, userId: member2.id, role: 'MEMBER' },
      { projectId: project2.id, userId: admin.id, role: 'OWNER' },
      { projectId: project2.id, userId: member3.id, role: 'MEMBER' },
      { projectId: project2.id, userId: member1.id, role: 'MEMBER' },
    ]
  })

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'トップページのデザイン刷新',
        description: 'ユーザーの離脱率改善のため、トップページのデザインを全面刷新する',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 16,
        projectId: project1.id,
        assigneeId: member2.id,
        creatorId: manager1.id,
        requiredSkills: JSON.stringify(['UI/UXデザイン', 'Figma', 'React']),
        dueDate: new Date('2026-03-20'),
        order: 1,
      },
      {
        title: '認証システムの実装',
        description: 'JWT認証を使ったログイン/ログアウト機能を実装する',
        status: 'DONE',
        priority: 'URGENT',
        estimatedHours: 8,
        actualHours: 9,
        projectId: project1.id,
        assigneeId: member1.id,
        creatorId: manager1.id,
        requiredSkills: JSON.stringify(['TypeScript', 'Node.js']),
        dueDate: new Date('2026-03-05'),
        completedAt: new Date('2026-03-04'),
        order: 2,
      },
      {
        title: 'APIエンドポイント設計書の作成',
        description: 'RESTful APIの設計書をOpenAPI形式で作成する',
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedHours: 6,
        projectId: project1.id,
        assigneeId: member1.id,
        creatorId: manager1.id,
        requiredSkills: JSON.stringify(['TypeScript', 'Node.js']),
        dueDate: new Date('2026-03-25'),
        order: 3,
      },
      {
        title: 'ユーザーテストの実施',
        description: 'プロトタイプを用いたユーザーテストを実施し、フィードバックを収集する',
        status: 'TODO',
        priority: 'MEDIUM',
        isMarketplace: true,
        estimatedHours: 12,
        projectId: project1.id,
        creatorId: manager1.id,
        requiredSkills: JSON.stringify(['UI/UXデザイン']),
        dueDate: new Date('2026-04-10'),
        order: 4,
      },
      {
        title: 'データパイプラインの構築',
        description: 'S3からBigQueryへのデータパイプラインを構築する',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 24,
        projectId: project2.id,
        assigneeId: member3.id,
        creatorId: admin.id,
        requiredSkills: JSON.stringify(['Python', 'データ分析', 'SQL']),
        dueDate: new Date('2026-03-28'),
        order: 1,
      },
      {
        title: 'ダッシュボードUIの実装',
        description: 'Reactを使って売上データ可視化ダッシュボードを実装する',
        status: 'TODO',
        priority: 'HIGH',
        isMarketplace: true,
        estimatedHours: 20,
        projectId: project2.id,
        creatorId: admin.id,
        requiredSkills: JSON.stringify(['React', 'TypeScript', 'データ分析']),
        dueDate: new Date('2026-04-15'),
        order: 2,
      },
      {
        title: 'パフォーマンステストの実施',
        description: 'データ量が増えた際のクエリパフォーマンスをテストする',
        status: 'TODO',
        priority: 'LOW',
        isMarketplace: true,
        estimatedHours: 8,
        projectId: project2.id,
        creatorId: admin.id,
        requiredSkills: JSON.stringify(['SQL', 'Python']),
        dueDate: new Date('2026-04-30'),
        order: 3,
      },
    ]
  })

  // Wellbeing Checkins
  const users = [member1, member2, member3, manager1]
  for (const user of users) {
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - w * 7 - weekStart.getDay() + 1)
      weekStart.setHours(0, 0, 0, 0)
      await prisma.wellbeingCheckin.create({
        data: {
          userId: user.id,
          weekStart,
          stressLevel: Math.floor(Math.random() * 3) + 1,
          energyLevel: Math.floor(Math.random() * 3) + 2,
          satisfactionLevel: Math.floor(Math.random() * 3) + 2,
          isAnonymous: false,
        }
      }).catch(() => {}) // ignore duplicates
    }
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: member1.id,
        title: '新しいタスクが公募されました',
        message: '「ダッシュボードUIの実装」が公募タスクとして登録されました',
        type: 'INFO',
        link: '/marketplace',
      },
      {
        userId: member1.id,
        title: 'タスクの期限が近づいています',
        message: '「APIエンドポイント設計書の作成」の期限まで5日です',
        type: 'WARNING',
        link: '/projects',
      },
      {
        userId: manager1.id,
        title: 'タスクへの応募がありました',
        message: '「ユーザーテストの実施」に応募がありました',
        type: 'SUCCESS',
        link: '/marketplace',
      },
    ]
  })

  console.log('✅ Seed data created successfully!')
  console.log('📧 Login accounts:')
  console.log('  admin@teamflow.dev / password123 (管理者)')
  console.log('  manager1@teamflow.dev / password123 (マネージャー: 鈴木花子)')
  console.log('  member1@teamflow.dev / password123 (メンバー: 佐藤健)')
  console.log('  member2@teamflow.dev / password123 (メンバー: 山田美咲)')
  console.log('  member3@teamflow.dev / password123 (メンバー: 伊藤拓也)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
