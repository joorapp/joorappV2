/**
 * @author Bhavesh Venugopal
 * Migration: Create ProjectUsers Table
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('project_users', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    project_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'projects', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
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

  // Add indexes for project_users
  await queryInterface.addIndex('project_users', ['project_id', 'user_id'], {
    unique: true,
    where: { is_deleted: false },
    name: 'project_users_project_user_unique'
  });
  await queryInterface.addIndex('project_users', ['project_id'], { name: 'project_users_project_id_idx' });
  await queryInterface.addIndex('project_users', ['user_id'], { name: 'project_users_user_id_idx' });
  await queryInterface.addIndex('project_users', ['is_active'], { name: 'project_users_is_active_idx' });

  console.log('✅ ProjectUsers table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('project_users');
  console.log('✅ ProjectUsers table dropped');
};
