/**
 * @author Bhavesh Venugopal
 * UserCompanyContext Model
 * Minimal mapping table linking Keycloak session_state to company context
 * Does NOT use AuditableEntity (simple mapping table)
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * UserCompanyContext model definition
 * Maps Keycloak session_state to active company for that session
 * User details come from JWT token, not stored here
 */
const UserCompanyContext = sequelize.define('UserCompanyContext', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    field: 'id'
  },
  keycloakSessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'keycloak_session_id',
    comment: 'Keycloak session ID from JWT token (unique per session)'
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'company_id',
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: 'Active company for this session (nullable for SUPER_ADMIN)'
  }
}, {
  tableName: 'user_company_context',
  timestamps: false, // Simple mapping table, no audit needed
  underscored: true,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['keycloak_session_id'],
      name: 'user_company_context_keycloak_session_id_unique'
    },
    {
      fields: ['company_id'],
      name: 'user_company_context_company_id_idx'
    }
  ]
});

/**
 * Define model associations
 * @param {Object} models - Object containing all models
 * @returns {void}
 */
UserCompanyContext.associate = (models) => {
  // BelongsTo Company
  UserCompanyContext.belongsTo(models.Company, { 
    foreignKey: 'companyId', 
    as: 'company' 
  });
};

export default UserCompanyContext;

