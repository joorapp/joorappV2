/**
 * @author Bhavesh Venugopal
 * Migration: Create Plans Table
 * Master data table with audit fields (no user FKs for created/updated)
 * Includes seed data for BASIC plan
 * NOTE: This migration runs BEFORE companies table (so companies can reference plans)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('plans', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Plan name (e.g., Basic, Premium, Enterprise)'
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique plan code/identifier (e.g., BASIC)'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Plan description'
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Plan price/cost'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the plan is active'
    },
    // Audit fields (master data - no user FKs for created/updated)
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
      onDelete: 'SET NULL',
      comment: 'User who soft-deleted this record (optional, nullable)'
    },
    version: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  });

  // Add indexes
  await queryInterface.addIndex('plans', ['name'], { 
    unique: true, 
    name: 'plans_name_unique' 
  });
  
  await queryInterface.addIndex('plans', ['code'], { 
    unique: true, 
    name: 'plans_code_unique' 
  });
  
  await queryInterface.addIndex('plans', ['is_active'], { 
    name: 'plans_is_active_idx' 
  });
  
  await queryInterface.addIndex('plans', ['is_deleted'], { 
    name: 'plans_is_deleted_idx' 
  });

  // Create BASIC plan seed data
  // Master data - no user dependency required
  await queryInterface.sequelize.query(`
    INSERT INTO plans (
      id, 
      name, 
      code, 
      description, 
      price,
      is_active,
      created_date,
      updated_date,
      is_deleted,
      version
    )
    VALUES (
      gen_random_uuid(),
      'Basic',
      'BASIC',
      'Basic subscription plan - default plan for new companies',
      0.00,
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP,
      false,
      1
    )
    ON CONFLICT (code) DO NOTHING;
  `);

  console.log('✅ Plans table created with BASIC plan seed data');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('plans');
  console.log('✅ Plans table dropped');
};

