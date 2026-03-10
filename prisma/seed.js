// Seed script for Docker (no tsx needed, plain Node.js)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hp = await bcrypt.hash('password123', 10);

  const d1 = await prisma.department.create({ data: { name: '開発部' } });
  const d2 = await prisma.department.create({ data: { name: 'マーケティング部' } });

  const admin = await prisma.user.create({ data: { email: 'admin@teamflow.dev', name: '田中 太郎', password: hp, role: 'ADMIN', departmentId: d1.id, capacityHours: 40 } });
  const mgr = await prisma.user.create({ data: { email: 'manager1@teamflow.dev', name: '鈴木 花子', password: hp, role: 'MANAGER', departmentId: d1.id, capacityHours: 40 } });
  const m1 = await prisma.user.create({ data: { email: 'member1@teamflow.dev', name: '佐藤 健', password: hp, role: 'MEMBER', departmentId: d1.id, capacityHours: 40 } });
  const m2 = await prisma.user.create({ data: { email: 'member2@teamflow.dev', name: '山田 美咲', password: hp, role: 'MEMBER', departmentId: d2.id, capacityHours: 32 } });
  const m3 = await prisma.user.create({ data: { email: 'member3@teamflow.dev', name: '伊藤 拓也', password: hp, role: 'MEMBER', departmentId: d1.id, capacityHours: 40 } });

  await prisma.userSkill.createMany({ data: [
    { userId: m1.id, skillName: 'React', category: 'technical', level: 4 },
    { userId: m1.id, skillName: 'TypeScript', category: 'technical', level: 4 },
    { userId: m1.id, skillName: 'Node.js', category: 'technical', level: 3 },
    { userId: m2.id, skillName: 'UI/UXデザイン', category: 'business', level: 5 },
    { userId: m2.id, skillName: 'Figma', category: 'technical', level: 4 },
    { userId: m3.id, skillName: 'Python', category: 'technical', level: 5 },
    { userId: m3.id, skillName: 'データ分析', category: 'business', level: 4 },
    { userId: m3.id, skillName: 'SQL', category: 'technical', level: 4 },
    { userId: mgr.id, skillName: 'プロジェクト管理', category: 'business', level: 5 },
    { userId: mgr.id, skillName: 'React', category: 'technical', level: 3 },
  ]});

  const t1 = await prisma.team.create({ data: { name: '開発チームA', departmentId: d1.id } });

  const p1 = await prisma.project.create({ data: { name: '社内ポータルリニューアル', description: '社内ポータルサイトのUI/UXを全面的にリニューアルするプロジェクト', status: 'ACTIVE', color: '#6366f1', teamId: t1.id, startDate: new Date('2026-02-01'), endDate: new Date('2026-06-30') } });
  const p2 = await prisma.project.create({ data: { name: 'データ分析基盤構築', description: '売上データの可視化ダッシュボードを構築するプロジェクト', status: 'ACTIVE', color: '#10b981', teamId: t1.id, startDate: new Date('2026-03-01'), endDate: new Date('2026-08-31') } });

  await prisma.projectMember.createMany({ data: [
    { projectId: p1.id, userId: admin.id, role: 'OWNER' },
    { projectId: p1.id, userId: mgr.id, role: 'MANAGER' },
    { projectId: p1.id, userId: m1.id, role: 'MEMBER' },
    { projectId: p1.id, userId: m2.id, role: 'MEMBER' },
    { projectId: p2.id, userId: admin.id, role: 'OWNER' },
    { projectId: p2.id, userId: m3.id, role: 'MEMBER' },
    { projectId: p2.id, userId: m1.id, role: 'MEMBER' },
  ]});

  await prisma.task.createMany({ data: [
    { title: 'トップページのデザイン刷新', description: 'ユーザーの離脱率改善のためデザインを全面刷新', status: 'IN_PROGRESS', priority: 'HIGH', estimatedHours: 16, projectId: p1.id, assigneeId: m2.id, creatorId: mgr.id, requiredSkills: JSON.stringify(['UI/UXデザイン', 'Figma', 'React']), dueDate: new Date('2026-03-20'), order: 1 },
    { title: '認証システムの実装', description: 'JWT認証を使ったログイン/ログアウト機能', status: 'DONE', priority: 'URGENT', estimatedHours: 8, actualHours: 9, projectId: p1.id, assigneeId: m1.id, creatorId: mgr.id, requiredSkills: JSON.stringify(['TypeScript', 'Node.js']), dueDate: new Date('2026-03-05'), completedAt: new Date('2026-03-04'), order: 2 },
    { title: 'APIエンドポイント設計書の作成', description: 'RESTful APIの設計書をOpenAPI形式で作成', status: 'TODO', priority: 'MEDIUM', estimatedHours: 6, projectId: p1.id, assigneeId: m1.id, creatorId: mgr.id, requiredSkills: JSON.stringify(['TypeScript', 'Node.js']), dueDate: new Date('2026-03-25'), order: 3 },
    { title: 'ユーザーテストの実施', description: 'プロトタイプを用いたユーザーテスト', status: 'TODO', priority: 'MEDIUM', isMarketplace: true, estimatedHours: 12, projectId: p1.id, creatorId: mgr.id, requiredSkills: JSON.stringify(['UI/UXデザイン']), dueDate: new Date('2026-04-10'), order: 4 },
    { title: 'データパイプラインの構築', description: 'S3からBigQueryへのデータパイプライン', status: 'IN_PROGRESS', priority: 'HIGH', estimatedHours: 24, projectId: p2.id, assigneeId: m3.id, creatorId: admin.id, requiredSkills: JSON.stringify(['Python', 'データ分析', 'SQL']), dueDate: new Date('2026-03-28'), order: 1 },
    { title: 'ダッシュボードUIの実装', description: 'Reactを使った売上データ可視化ダッシュボード', status: 'TODO', priority: 'HIGH', isMarketplace: true, estimatedHours: 20, projectId: p2.id, creatorId: admin.id, requiredSkills: JSON.stringify(['React', 'TypeScript', 'データ分析']), dueDate: new Date('2026-04-15'), order: 2 },
    { title: 'パフォーマンステストの実施', description: 'データ量増加時のクエリパフォーマンステスト', status: 'TODO', priority: 'LOW', isMarketplace: true, estimatedHours: 8, projectId: p2.id, creatorId: admin.id, requiredSkills: JSON.stringify(['SQL', 'Python']), dueDate: new Date('2026-04-30'), order: 3 },
  ]});

  console.log('Seed data created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
