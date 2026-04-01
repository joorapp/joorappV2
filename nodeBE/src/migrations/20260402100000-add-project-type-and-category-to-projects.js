/**
 * @author Bhavesh Venugopal
 * Migration: Add project_type_id and project_category_id to projects (required FKs)
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('projects', 'project_type_id', {
    type: Sequelize.UUID,
    allowNull: false,
    references: { model: 'project_types', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  });
  await queryInterface.addColumn('projects', 'project_category_id', {
    type: Sequelize.UUID,
    allowNull: false,
    references: { model: 'project_categories', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  });

  await queryInterface.addIndex('projects', ['project_type_id'], {
    name: 'projects_project_type_id_idx'
  });
  await queryInterface.addIndex('projects', ['project_category_id'], {
    name: 'projects_project_category_id_idx'
  });

  console.log('✅ projects.project_type_id and projects.project_category_id added');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeIndex('projects', 'projects_project_category_id_idx');
  await queryInterface.removeIndex('projects', 'projects_project_type_id_idx');
  await queryInterface.removeColumn('projects', 'project_category_id');
  await queryInterface.removeColumn('projects', 'project_type_id');
  console.log('✅ projects type/category columns removed');
};
