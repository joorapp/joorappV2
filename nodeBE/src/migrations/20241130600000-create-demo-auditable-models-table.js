/**
 * @author Bhavesh Venugopal
 * Migration: Create Demo Auditable Models Table
 * Demo table to test AuditableEntity mixin pattern
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('demo_auditable_models', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
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
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'active'
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
  await queryInterface.addIndex('demo_auditable_models', ['name'], { 
    name: 'demo_auditable_models_name_idx' 
  });
  
  await queryInterface.addIndex('demo_auditable_models', ['status'], { 
    name: 'demo_auditable_models_status_idx' 
  });
  
  await queryInterface.addIndex('demo_auditable_models', ['is_deleted'], { 
    name: 'demo_auditable_models_is_deleted_idx' 
  });

  console.log('✅ Demo Auditable Models table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('demo_auditable_models');
  console.log('✅ Demo Auditable Models table dropped');
};

