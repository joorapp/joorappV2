/**
 * @author Bhavesh Venugopal
 * Migration: Create Client Types Table
 * Company-scoped reference data (super admin company = defaults; tenant = custom)
 * Standalone master data; may be linked to other entities in future migrations.
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('client_types', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    client_type: {
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

  await queryInterface.addIndex('client_types', ['is_deleted'], { name: 'client_types_is_deleted_idx' });
  await queryInterface.addIndex('client_types', ['is_active'], { name: 'client_types_is_active_idx' });
  await queryInterface.addIndex('client_types', ['created_company_id'], {
    name: 'client_types_created_company_id_idx'
  });
  await queryInterface.addIndex('client_types', ['client_type'], { name: 'client_types_client_type_idx' });

  console.log('✅ Client types table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('client_types');
  console.log('✅ Client types table dropped');
};
