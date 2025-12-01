/**
 * @author Bhavesh Venugopal
 * Migration: Create User Company Context Table
 * Maps Keycloak session_state to active company for that session
 * Note: Does NOT use AuditableEntity (simple mapping table)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('user_company_context', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false,
      comment: 'Primary key'
    },
    keycloak_session_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      comment: 'Keycloak session ID from JWT token (unique per session)'
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Active company for this session (nullable for SUPER_ADMIN)'
    }
  });

  // Add indexes
  await queryInterface.addIndex('user_company_context', ['keycloak_session_id'], { 
    unique: true, 
    name: 'user_company_context_keycloak_session_id_unique' 
  });
  
  await queryInterface.addIndex('user_company_context', ['company_id'], { 
    name: 'user_company_context_company_id_idx' 
  });

  console.log('✅ User Company Context table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('user_company_context');
  console.log('✅ User Company Context table dropped');
};

