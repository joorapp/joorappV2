/**
 * @author Bhavesh Venugopal
 * Migration: Create Clients Table
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('clients', {
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
    email: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    client_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
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

  // Add indexes for clients
  await queryInterface.addIndex('clients', ['is_active'], { name: 'clients_is_active_idx' });
  await queryInterface.addIndex('clients', ['is_deleted'], { name: 'clients_is_deleted_idx' });
  await queryInterface.addIndex('clients', ['name'], { name: 'clients_name_idx' });

  console.log('✅ Clients table created');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('clients');
  console.log('✅ Clients table dropped');
};
