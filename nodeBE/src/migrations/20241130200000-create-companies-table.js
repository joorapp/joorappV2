/**
 * @author Bhavesh Venugopal
 * Migration: Create Companies Table
 * With audit fields (references Users table)
 * Includes: contact fields, structured address, logo, status enum, and plan_id
 */

export const up = async (queryInterface, Sequelize) => {
  // 1. Create ENUM type for company status
  // Note: Enum values must match COMPANY_STATUS_VALUES in constants/companyStatus.js
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE enum_companies_status AS ENUM ('NEW', 'ACTIVE', 'LICENSE_EXPIRED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 2. Create companies table with all fields
  await queryInterface.createTable('companies', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(255),
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
    // Contact fields
    email: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    // Address fields
    building_address: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    street_address: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    city: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    state: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    postal_code: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    country: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    // Logo field
    logo: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    // Status field (using ENUM type)
    status: {
      type: Sequelize.ENUM('NEW', 'ACTIVE', 'LICENSE_EXPIRED'),
      allowNull: false,
      defaultValue: 'NEW'
    },
    // Plan foreign key (plans table created before companies)
    plan_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'plans', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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

  // 3. Add indexes
  await queryInterface.addIndex('companies', ['name'], { 
    unique: true, 
    name: 'companies_name_unique' 
  });
  
  await queryInterface.addIndex('companies', ['is_active'], { 
    name: 'companies_is_active_idx' 
  });
  
  await queryInterface.addIndex('companies', ['is_deleted'], { 
    name: 'companies_is_deleted_idx' 
  });

  // New indexes for enhancement fields
  await queryInterface.addIndex('companies', ['email'], {
    name: 'companies_email_idx',
    unique: false
  });

  await queryInterface.addIndex('companies', ['status'], {
    name: 'companies_status_idx'
  });

  await queryInterface.addIndex('companies', ['plan_id'], {
    name: 'companies_plan_id_idx'
  });

  console.log('✅ Companies table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('companies');
  // Drop ENUM type
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_companies_status;');
  console.log('✅ Companies table dropped');
};

