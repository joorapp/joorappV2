/**
 * @author Bhavesh Venugopal
 * Migration: Create Company Roles Table
 * With audit fields (references Users and Companies tables)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('company_roles', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
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
  await queryInterface.addIndex('company_roles', ['name'], { 
    unique: true, 
    name: 'company_roles_name_unique' 
  });
  
  await queryInterface.addIndex('company_roles', ['code'], { 
    unique: true, 
    name: 'company_roles_code_unique' 
  });
  
  await queryInterface.addIndex('company_roles', ['is_active'], { 
    name: 'company_roles_is_active_idx' 
  });
  
  await queryInterface.addIndex('company_roles', ['is_deleted'], { 
    name: 'company_roles_is_deleted_idx' 
  });

  console.log('✅ Company Roles table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('company_roles');
  console.log('✅ Company Roles table dropped');
};

