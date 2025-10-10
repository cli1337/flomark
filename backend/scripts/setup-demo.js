import prisma from '../src/config/database.js';
import { ENV } from '../src/config/env.js';

/**
 * Setup Demo Project
 * Creates a demo project with sample data for demo mode
 */

const DEMO_PROJECT_ID = ENV.DEMO_PROJECT_ID || 'demo-project';

async function setupDemo() {
  console.log('🎭 Setting up Demo Mode...\n');

  try {
    // Create or get demo user
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@flomark.local' }
    });

    if (!demoUser) {
      console.log('Creating demo user...');
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@flomark.local',
          username: 'Demo User',
          password: 'demo-user-no-password',
          role: 'USER',
          emailVerified: true
        }
      });
      console.log('✓ Demo user created');
    } else {
      console.log('✓ Demo user already exists');
    }

    // Create demo project
    let demoProject = await prisma.project.findFirst({
      where: {
        OR: [
          { id: DEMO_PROJECT_ID },
          { name: 'Demo Project' }
        ]
      }
    });

    if (!demoProject) {
      console.log('Creating demo project...');
      demoProject = await prisma.project.create({
        data: {
          id: DEMO_PROJECT_ID,
          name: 'Demo Project - Try Flomark!',
          description: 'Welcome to Flomark! Feel free to create tasks, move them around, and explore all features. Changes are visible to all demo users.',
          ownerId: demoUser.id,
          members: {
            create: {
              userId: demoUser.id,
              role: 'OWNER'
            }
          }
        }
      });
      console.log('✓ Demo project created');
    } else {
      console.log('✓ Demo project already exists');
    }

    // Create demo lists (columns)
    const lists = [
      { name: 'To Do', order: 0 },
      { name: 'In Progress', order: 1 },
      { name: 'Review', order: 2 },
      { name: 'Done', order: 3 }
    ];

    console.log('Creating demo lists...');
    for (const listData of lists) {
      const existingList = await prisma.list.findFirst({
        where: {
          projectId: demoProject.id,
          name: listData.name
        }
      });

      if (!existingList) {
        await prisma.list.create({
          data: {
            ...listData,
            projectId: demoProject.id
          }
        });
        console.log(`  ✓ Created list: ${listData.name}`);
      }
    }

    // Get lists for task creation
    const todoList = await prisma.list.findFirst({
      where: { projectId: demoProject.id, name: 'To Do' }
    });

    const inProgressList = await prisma.list.findFirst({
      where: { projectId: demoProject.id, name: 'In Progress' }
    });

    const doneList = await prisma.list.findFirst({
      where: { projectId: demoProject.id, name: 'Done' }
    });

    // Create demo labels
    console.log('Creating demo labels...');
    const labels = [
      { name: 'Feature', color: '#3b82f6' },
      { name: 'Bug', color: '#ef4444' },
      { name: 'Enhancement', color: '#10b981' },
      { name: 'Documentation', color: '#f59e0b' }
    ];

    for (const labelData of labels) {
      const existingLabel = await prisma.label.findFirst({
        where: {
          projectId: demoProject.id,
          name: labelData.name
        }
      });

      if (!existingLabel) {
        await prisma.label.create({
          data: {
            ...labelData,
            projectId: demoProject.id
          }
        });
        console.log(`  ✓ Created label: ${labelData.name}`);
      }
    }

    // Get labels for task assignment
    const featureLabel = await prisma.label.findFirst({
      where: { projectId: demoProject.id, name: 'Feature' }
    });

    const bugLabel = await prisma.label.findFirst({
      where: { projectId: demoProject.id, name: 'Bug' }
    });

    // Create sample tasks
    console.log('Creating sample tasks...');
    const tasks = [
      {
        title: '👋 Welcome to Flomark!',
        description: 'This is a demo task. Click on it to see more details, add subtasks, upload files, and more!\n\nFeel free to:\n- Create new tasks\n- Move tasks between columns\n- Add labels and due dates\n- Upload attachments\n- Create subtasks',
        listId: todoList.id,
        order: 0,
        labelId: featureLabel?.id
      },
      {
        title: '🎨 Try the drag and drop feature',
        description: 'Drag this task to another column to see real-time updates!',
        listId: todoList.id,
        order: 1,
        labelId: featureLabel?.id
      },
      {
        title: '📝 Click to edit this task',
        description: 'Edit the title, description, add labels, set due dates, and more.',
        listId: inProgressList.id,
        order: 0
      },
      {
        title: '✅ Mark tasks as complete',
        description: 'Drag tasks to the "Done" column when you complete them!',
        listId: inProgressList.id,
        order: 1
      },
      {
        title: '🎉 You completed a task!',
        description: 'Great job! This is how completed tasks look.',
        listId: doneList.id,
        order: 0,
        labelId: featureLabel?.id
      }
    ];

    for (const taskData of tasks) {
      const existingTask = await prisma.task.findFirst({
        where: {
          listId: taskData.listId,
          title: taskData.title
        }
      });

      if (!existingTask) {
        await prisma.task.create({
          data: {
            ...taskData,
            createdBy: demoUser.id
          }
        });
        console.log(`  ✓ Created task: ${taskData.title}`);
      }
    }

    console.log('\n✨ Demo setup complete!\n');
    console.log('Demo Project ID:', demoProject.id);
    console.log('Demo User Email:', demoUser.email);
    console.log('\nYou can now access the demo project at:');
    console.log(`  /projects/${demoProject.id}\n`);
    console.log('Make sure DEMO_MODE=true is set in your .env file\n');

  } catch (error) {
    console.error('Error setting up demo:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDemo();

