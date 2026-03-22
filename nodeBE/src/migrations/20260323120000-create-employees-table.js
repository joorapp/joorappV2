/**
 * @author Bhavesh Venugopal
 * Migration: Create employees table (company-scoped HR records)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('employees', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      allowNull: false
    },
    first_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    last_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    employee_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    job_title_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'job_titles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    salary: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    company_user_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'company_users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Links to company_users when this employee can log in for this company'
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

  await queryInterface.addIndex('employees', ['created_company_id'], { name: 'employees_created_company_id_idx' });
  await queryInterface.addIndex('employees', ['job_title_id'], { name: 'employees_job_title_id_idx' });
  await queryInterface.addIndex('employees', ['company_user_id'], { name: 'employees_company_user_id_idx' });
  await queryInterface.addIndex('employees', ['is_deleted'], { name: 'employees_is_deleted_idx' });
  await queryInterface.addIndex('employees', ['is_active'], { name: 'employees_is_active_idx' });

  // One active (non-deleted) email per company — allows reuse after soft delete
  await queryInterface.sequelize.query(`
    CREATE UNIQUE INDEX employees_created_company_id_email_active_uq
    ON employees (created_company_id, LOWER(TRIM(email)))
    WHERE is_deleted = false
  `);

  // At most one employee row per company_users assignment (when linked)
  await queryInterface.sequelize.query(`
    CREATE UNIQUE INDEX employees_company_user_id_uq
    ON employees (company_user_id)
    WHERE company_user_id IS NOT NULL
  `);

  console.log('✅ Employees table created');
};

export const down = async (queryInterface) => {
  await queryInterface.sequelize.query('DROP INDEX IF EXISTS employees_company_user_id_uq');
  await queryInterface.sequelize.query('DROP INDEX IF EXISTS employees_created_company_id_email_active_uq');
  await queryInterface.dropTable('employees');
  console.log('✅ Employees table dropped');
};
