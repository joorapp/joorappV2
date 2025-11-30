/**
 * @author Bhavesh Venugopal
 * Migration: Create Company Users Table
 * Junction table with audit fields (references Users, Companies, CompanyRoles)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('company_users', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'companies', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    company_role_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'company_roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
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

  // Add indexes
  await queryInterface.addIndex('company_users', ['user_id', 'company_id'], { 
    unique: true, 
    name: 'company_users_user_company_unique' 
  });
  
  await queryInterface.addIndex('company_users', ['user_id'], { 
    name: 'company_users_user_id_idx' 
  });
  
  await queryInterface.addIndex('company_users', ['company_id'], { 
    name: 'company_users_company_id_idx' 
  });
  
  await queryInterface.addIndex('company_users', ['company_role_id'], { 
    name: 'company_users_role_id_idx' 
  });
  
  await queryInterface.addIndex('company_users', ['is_active'], { 
    name: 'company_users_is_active_idx' 
  });
  
  await queryInterface.addIndex('company_users', ['is_deleted'], { 
    name: 'company_users_is_deleted_idx' 
  });

  console.log('✅ Company Users table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('company_users');
  console.log('✅ Company Users table dropped');
};

