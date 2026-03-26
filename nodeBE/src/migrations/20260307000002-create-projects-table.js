/**
 * @author Bhavesh Venugopal
 * Migration: Create Projects Table
 */

export const up = async (queryInterface, Sequelize) => {
  // Custom enum type for project status
  const projectStatusValues = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
  
  await queryInterface.createTable('projects', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    client_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'clients', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM(...projectStatusValues),
      allowNull: false,
      defaultValue: 'PLANNING'
    },
    start_date: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    project_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    // Audit fields
    created_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    created_user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    created_company_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    updated_user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleted_user_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    version: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  });

  // Add indexes for projects
  await queryInterface.addIndex('projects', ['client_id'], { name: 'projects_client_id_idx' });
  await queryInterface.addIndex('projects', ['status'], { name: 'projects_status_idx' });
  await queryInterface.addIndex('projects', ['is_deleted'], { name: 'projects_is_deleted_idx' });
  await queryInterface.addIndex('projects', ['name'], { name: 'projects_name_idx' });

  console.log('✅ Projects table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('projects');
  
  // Need to drop the ENUM type created for projects.status
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_projects_status";');
  
  console.log('✅ Projects table dropped');
};
