import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if demo mode is enabled
const isDemoMode = process.env.DEMO_MODE === "true";

let prisma;
let DemoDataService;

// Initialize Prisma client based on mode
async function initializePrisma() {
  if (isDemoMode) {
    console.log('🎭 Demo Mode: Creating isolated mock Prisma client (NO DATABASE ACCESS)');
    
    // In demo mode, load demo data service
    const module = await import('../services/demo-data.service.js');
    DemoDataService = module.DemoDataService;
    
    // Create a proxy that uses in-memory data
    return new Proxy({}, {
      get: (target, prop) => {
        // Return mock Prisma operations
        if (prop === 'user') {
          return {
            findUnique: async ({ where }) => {
              if (where.email) return DemoDataService.findUserByEmail(where.email);
              if (where.id) return DemoDataService.findUserById(where.id);
              return null;
            },
            findFirst: async ({ where }) => {
              if (where.email) return DemoDataService.findUserByEmail(where.email);
              return null;
            },
            findMany: async () => {
              return DemoDataService.getAllData().users;
            },
            create: async ({ data }) => {
              // In demo mode, don't allow creating new users
              return DemoDataService.findUserByEmail('demo@flomark.app');
            },
            update: async ({ where, data }) => {
              // In demo mode, updates are no-ops (user data doesn't persist)
              const user = where.id ? DemoDataService.findUserById(where.id) : DemoDataService.findUserByEmail(where.email);
              return user;
            },
            count: async () => {
              return DemoDataService.getAllData().users.length;
            }
          };
        }
        
      if (prop === 'project') {
        return {
          findMany: async ({ where }) => {
            if (where?.members?.some) {
              const userId = where.members.some.userId;
              return DemoDataService.findAllProjects(userId);
            }
            return DemoDataService.getAllData().projects;
          },
          findUnique: async ({ where, include }) => {
            const project = DemoDataService.findProjectById(where.id);
            if (project && include) {
              const result = { ...project };
              if (include.members) {
                result.members = DemoDataService.findMembersByProject(project.id).map(m => ({
                  ...m,
                  user: DemoDataService.findUserById(m.userId)
                }));
              }
              if (include.lists) {
                result.lists = DemoDataService.findListsByProject(project.id);
              }
              return result;
            }
            return project;
          },
          create: async ({ data }) => {
            const project = DemoDataService.createProject(data);
            if (data.ownerId) {
              DemoDataService.createMember({
                userId: data.ownerId,
                projectId: project.id,
                role: 'OWNER'
              });
            }
            return project;
          },
          update: async ({ where, data }) => {
            return DemoDataService.updateProject(where.id, data);
          },
          delete: async ({ where }) => {
            DemoDataService.deleteProject(where.id);
            return {};
          },
          count: async ({ where }) => {
            if (where?.members?.some) {
              const userId = where.members.some.userId;
              return DemoDataService.findAllProjects(userId).length;
            }
            return DemoDataService.getAllData().projects.length;
          }
        };
      }
        
        if (prop === 'list') {
          return {
            findMany: async ({ where }) => {
              return DemoDataService.findListsByProject(where.projectId);
            },
            findUnique: async ({ where }) => {
              return DemoDataService.findListById(where.id);
            },
            findFirst: async ({ where }) => {
              const lists = DemoDataService.findListsByProject(where.projectId);
              return lists.find(l => l.name === where.name) || null;
            },
            create: async ({ data }) => {
              return DemoDataService.createList(data);
            },
            update: async ({ where, data }) => {
              return DemoDataService.updateList(where.id, data);
            },
            updateMany: async () => ({ count: 0 }),
            count: async ({ where }) => {
              if (where?.projectId) {
                return DemoDataService.findListsByProject(where.projectId).length;
              }
              return DemoDataService.getAllData().lists.length;
            }
          };
        }
        
        if (prop === 'task') {
          return {
            findMany: async ({ where, include }) => {
              let tasks = [];
              if (where?.listId) {
                tasks = DemoDataService.findTasksByList(where.listId);
              }
              if (include) {
                tasks = tasks.map(task => {
                  const result = { ...task };
                  if (include.label && task.labelId) {
                    result.label = DemoDataService.findLabelById(task.labelId);
                  }
                  if (include.subTasks) {
                    result.subTasks = DemoDataService.findSubtasksByTask(task.id);
                  }
                  if (include.attachments) {
                    result.attachments = DemoDataService.findAttachmentsByTask(task.id);
                  }
                  return result;
                });
              }
              return tasks;
            },
            findUnique: async ({ where, include }) => {
              const task = DemoDataService.findTaskById(where.id);
              if (task && include) {
                const result = { ...task };
                if (include.label && task.labelId) {
                  result.label = DemoDataService.findLabelById(task.labelId);
                }
                if (include.subTasks) {
                  result.subTasks = DemoDataService.findSubtasksByTask(task.id);
                }
                if (include.attachments) {
                  result.attachments = DemoDataService.findAttachmentsByTask(task.id);
                }
                if (include.createdByUser) {
                  result.createdByUser = DemoDataService.findUserById(task.createdBy);
                }
                return result;
              }
              return task;
            },
            create: async ({ data }) => {
              return DemoDataService.createTask(data);
            },
            update: async ({ where, data }) => {
              return DemoDataService.updateTask(where.id, data);
            },
            delete: async ({ where }) => {
              DemoDataService.deleteTask(where.id);
              return {};
            },
            updateMany: async () => ({ count: 0 }),
            count: async ({ where }) => {
              if (where?.listId) {
                return DemoDataService.findTasksByList(where.listId).length;
              }
              return DemoDataService.getAllData().tasks.length;
            }
          };
        }
        
        if (prop === 'label') {
          return {
            findMany: async ({ where }) => {
              return DemoDataService.findLabelsByProject(where.projectId);
            },
            findUnique: async ({ where }) => {
              return DemoDataService.findLabelById(where.id);
            },
            findFirst: async ({ where }) => {
              const labels = DemoDataService.findLabelsByProject(where.projectId);
              return labels.find(l => l.name === where.name) || null;
            },
            create: async ({ data }) => {
              return DemoDataService.createLabel(data);
            },
            update: async ({ where, data }) => {
              return DemoDataService.updateLabel(where.id, data);
            },
            delete: async ({ where }) => {
              DemoDataService.deleteLabel(where.id);
              return {};
            },
            count: async ({ where }) => {
              if (where?.projectId) {
                return DemoDataService.findLabelsByProject(where.projectId).length;
              }
              return DemoDataService.getAllData().labels.length;
            }
          };
        }
        
        if (prop === 'member') {
          return {
            findMany: async ({ where, include }) => {
              const members = DemoDataService.findMembersByProject(where.projectId);
              if (include?.user) {
                return members.map(m => ({
                  ...m,
                  user: DemoDataService.findUserById(m.userId)
                }));
              }
              return members;
            },
            findFirst: async ({ where }) => {
              return DemoDataService.findMemberByUserAndProject(where.userId, where.projectId);
            },
            create: async ({ data }) => {
              return DemoDataService.createMember(data);
            },
            delete: async ({ where }) => {
              DemoDataService.deleteMember(where.id);
              return {};
            },
            update: async ({ where, data }) => {
              const allMembers = DemoDataService.getAllData().members;
              const member = allMembers.find(m => m.id === where.id);
              if (member) {
                Object.assign(member, data);
              }
              return member;
            },
            count: async ({ where }) => {
              if (where?.projectId) {
                return DemoDataService.findMembersByProject(where.projectId).length;
              }
              return DemoDataService.getAllData().members.length;
            }
          };
        }
        
        if (prop === 'subTask') {
          return {
            findMany: async ({ where }) => {
              return DemoDataService.findSubtasksByTask(where.taskId);
            },
            create: async ({ data }) => {
              return DemoDataService.createSubtask(data);
            },
            update: async ({ where, data }) => {
              return DemoDataService.updateSubtask(where.id, data);
            },
            delete: async ({ where }) => {
              DemoDataService.deleteSubtask(where.id);
              return {};
            }
          };
        }
        
        if (prop === 'attachment') {
          return {
            findMany: async ({ where }) => {
              return DemoDataService.findAttachmentsByTask(where.taskId);
            },
            create: async ({ data }) => {
              return DemoDataService.createAttachment(data);
            },
            delete: async ({ where }) => {
              DemoDataService.deleteAttachment(where.id);
              return {};
            }
          };
        }
        
        if (prop === 'notification') {
          return {
            create: async () => ({}),
            findMany: async () => ([]),
            update: async () => ({}),
            deleteMany: async () => ({ count: 0 }),
            count: async () => 0
          };
        }
        
        if (prop === 'invitation') {
          return {
            create: async () => ({ inviteLink: 'demo-invite' }),
            findUnique: async () => null,
            delete: async () => ({})
          };
        }
        
        // Catch-all: For any Prisma operation not explicitly handled above
        // Return safe defaults to prevent any database access
        console.warn(`⚠️  Demo Mode: Unhandled Prisma operation on '${String(prop)}' - returning safe default`);
        return {
          findMany: async () => [],
          findUnique: async () => null,
          findFirst: async () => null,
          create: async () => ({}),
          update: async () => ({}),
          delete: async () => ({}),
          deleteMany: async () => ({ count: 0 }),
          updateMany: async () => ({ count: 0 }),
          count: async () => 0,
          aggregate: async () => ({}),
          groupBy: async () => [],
          $connect: async () => { console.warn('⚠️  Demo Mode: Attempted $connect - BLOCKED'); },
          $disconnect: async () => { console.log('✅ Demo Mode: Mock disconnect'); },
          $transaction: async (fn) => {
            console.warn('⚠️  Demo Mode: Transaction attempted - executing in mock mode');
            return typeof fn === 'function' ? fn(prisma) : fn;
          },
          $executeRaw: async () => { throw new Error('🚫 Demo Mode: Raw database queries are not allowed'); },
          $queryRaw: async () => { throw new Error('🚫 Demo Mode: Raw database queries are not allowed'); }
        };
      }
    });
  } else {
    // Normal mode - use real Prisma client
    console.log('💾 Production Mode: Initializing real Prisma client');
    return new PrismaClient();
  }
}

// Initialize immediately
prisma = await initializePrisma();

export async function connectDatabase() {
  // Skip database connection in demo mode
  if (isDemoMode) {
    console.log("🎭 Demo Mode: Skipping database connection");
    console.log("✅ Using 100% in-memory storage - NO database will be touched");
    console.log("🔒 Database access is completely blocked in demo mode");
    return;
  }

  try {
    await prisma.$connect();
    console.log("✅ Connected to MongoDB (via Prisma)");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("💡 Tip: Set DEMO_MODE=true in .env to run without database");
    process.exit(1);
  }
}

// Export with safety check
export { prisma };

// Additional safety: Prevent accidental database access in demo mode
if (isDemoMode && process.env.DATABASE_URL) {
  console.warn('⚠️  Warning: DATABASE_URL is set but DEMO_MODE=true');
  console.warn('   Database will NOT be used - all operations are in-memory only');
}
