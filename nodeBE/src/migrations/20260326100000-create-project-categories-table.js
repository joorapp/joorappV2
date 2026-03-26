/**
 * @author Bhavesh Venugopal
 * Migration: Create Project Categories Table
 * Company-scoped reference data (super admin company = defaults; tenant = custom)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('project_categories', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    project_category: {
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

  await queryInterface.addIndex('project_categories', ['is_deleted'], {
    name: 'project_categories_is_deleted_idx'
  });
  await queryInterface.addIndex('project_categories', ['is_active'], {
    name: 'project_categories_is_active_idx'
  });
  await queryInterface.addIndex('project_categories', ['created_company_id'], {
    name: 'project_categories_created_company_id_idx'
  });
  await queryInterface.addIndex('project_categories', ['project_category'], {
    name: 'project_categories_project_category_idx'
  });

  console.log('✅ Project categories table created');
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('project_categories');
  console.log('✅ Project categories table dropped');
};
