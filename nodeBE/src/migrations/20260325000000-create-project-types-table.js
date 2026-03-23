/**
 * @author Bhavesh Venugopal
 * Migration: Create Project Types Table
 * Company-scoped reference data (super admin company = defaults; tenant = custom)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('project_types', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    project_type: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
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

  await queryInterface.addIndex('project_types', ['is_deleted'], { name: 'project_types_is_deleted_idx' });
  await queryInterface.addIndex('project_types', ['is_active'], { name: 'project_types_is_active_idx' });
  await queryInterface.addIndex('project_types', ['created_company_id'], {
    name: 'project_types_created_company_id_idx'
  });
  await queryInterface.addIndex('project_types', ['project_type'], { name: 'project_types_project_type_idx' });

  console.log('✅ Project types table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('project_types');
  console.log('✅ Project types table dropped');
};
