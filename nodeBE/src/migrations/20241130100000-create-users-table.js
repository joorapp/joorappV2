/**
 * @author Bhavesh Venugopal
 * Migration: Create Users Table
 * Reference table - no audit fields to avoid circular dependency
 */

export const up = async (queryInterface, Sequelize) => {
  // 1. Create ENUM type for keycloak_global_role
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE enum_users_keycloak_global_role AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 2. Create users table
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    keycloak_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    first_name: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    last_name: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    keycloak_global_role: {
      type: Sequelize.ENUM('SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER'),
      allowNull: false,
      defaultValue: 'COMPANY_USER'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // 3. Add indexes
  await queryInterface.addIndex('users', ['email'], { 
    unique: true, 
    name: 'users_email_unique' 
  });
  
  await queryInterface.addIndex('users', ['keycloak_id'], { 
    unique: true, 
    name: 'users_keycloak_id_unique' 
  });
  
  await queryInterface.addIndex('users', ['is_active'], { 
    name: 'users_is_active_idx' 
  });

  console.log('✅ Users table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('users');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_keycloak_global_role;');
  console.log('✅ Users table dropped');
};

