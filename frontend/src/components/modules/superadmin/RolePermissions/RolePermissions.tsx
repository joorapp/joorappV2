/**
 * @author Auto-generated
 * Role Permissions component for the application
 * This component manages permissions for roles
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Button, Badge, Input, InputGroup, Modal, ModalHeader, ModalBody, ModalFooter, Label, Table } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { showSuccessToast } from '../../../../core/utils/toast';

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

interface ActionItem {
  name: string;
  value: string;
}

interface ActionItem {
  name: string;
  value: string;
}

interface Permission {
  id: string;
  code?: string;
  name?: string;
  module: string;
  action: string | ActionItem[];
  description?: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: Permission;
}

interface ModulePermissions {
  module: string;
  permissions: Permission[];
}

const RolePermissions = () => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createPermissionModalOpen, setCreatePermissionModalOpen] = useState(false);
  const [newPermission, setNewPermission] = useState({
    code: '',
    name: '',
    module: '',
    action: '',
    description: ''
  });
  const [viewRoleModalOpen, setViewRoleModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [deleteRoleModalOpen, setDeleteRoleModalOpen] = useState(false);
  const [selectedRoleForAction, setSelectedRoleForAction] = useState<Role | null>(null);
  const [editRoleFormData, setEditRoleFormData] = useState<Role | null>(null);

  // Initialize with dummy data on component mount
  useEffect(() => {
    // Initialize roles and permissions with dummy data immediately
    const demoRoles = getDemoRoles();
    const demoPermissions = getDemoPermissions();

    // Expand permissions: convert action arrays to individual permission entries
    const expandedPermissions: Permission[] = demoPermissions.flatMap(permission => {
      if (Array.isArray(permission.action)) {
        return permission.action.map((actionItem: ActionItem) => ({
          ...permission,
          id: `${permission.id}_${actionItem.value}`,
          code: `${permission.module}_${actionItem.value.toLowerCase()}`,
          name: `${permission.module} ${actionItem.name}`,
          action: actionItem.value,
          description: `${actionItem.name} permission for ${permission.module}`
        }));
      } else {
        return [permission];
      }
    });
    
    setRoles(demoRoles);
    setPermissions(expandedPermissions);
    
    // Auto-select first role
    if (demoRoles.length > 0) {
      setSelectedRole(demoRoles[0]);
    }
    
    // Optionally try to fetch from API (will keep demo data if fails)
  }, []);

  // Auto-select first role when roles are loaded (if no role selected)
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // Fetch role permissions when role is selected
  useEffect(() => {
    if (selectedRole) {
      setRolePermissions(getDemoRolePermissions(selectedRole.id));
    } else {
      setRolePermissions([]);
    }
  }, [selectedRole]);

  // Demo/Mock data for demonstration
  const getDemoRoles = (): Role[] => [
    {
      id: '1',
      name: 'Company Admin',
      code: 'COMPANY_ADMIN',
      description: 'Full administrative access to company resources',
      isActive: true,
    },
    {
      id: '2',
      name: 'Project Manager',
      code: 'PROJECT_MANAGER',
      description: 'Manages projects and team members',
      isActive: true,
    },
    {
      id: '3',
      name: 'Site Supervisor',
      code: 'SITE_SUPERVISOR',
      description: 'Oversees site operations and materials',
      isActive: true,
    },
    {
      id: '4',
      name: 'Accountant',
      code: 'ACCOUNTANT',
      description: 'Manages financial records and expenses',
      isActive: true,
    },
  ];

  const getDemoPermissions = (): Permission[] => [
    // Dashboard
    {
      id: 'p1',
      module: 'dashboard',
      action: [{

        'name': 'Manage',
        'value': 'MANAGE',
      },
      {
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ],
    },
    
    // Staff Management
    {
      id: 'p2',
      module: 'staffManagement',
      action: [
        {
          'name': 'Create',
          'value': 'CREATE',
        },
        {
          'name': 'Update',
          'value': 'UPDATE',
        },
        {
          'name': 'Delete',
          'value': 'DELETE',
        },
        {
          'name': 'View',
          'value': 'VIEW',
        },
      ],
    },

    // Client Management
    {
      id: 'p3', module: 'clientManagement',
      action: [
        {
          'name': 'Create',
          'value': 'CREATE',
        },
        {
          'name': 'Update',
          'value': 'UPDATE',
        },
        {
          'name': 'Delete',
          'value': 'DELETE',
        },
        {
          'name': 'View',
          'value': 'VIEW',
        },
      ],
    },

    // Supplier Management
    {
      id: 'p4',
      module: 'supplierManagement',
      action: [
        {
          'name': 'Create',
          'value': 'CREATE',
        },
        {
          'name': 'Update',
          'value': 'UPDATE',
        },
        {
          'name': 'Delete',
          'value': 'DELETE',
        },
        {
          'name': 'View',
          'value': 'VIEW',
        },
      ],
    },
    
    // Project Management
    {
      id: 'p5', module: 'projectManagement', 
      action: [
        {
          'name': 'Create',
          'value': 'CREATE',
        },
        {
          'name': 'Update',
          'value': 'UPDATE',
        },
        {
          'name': 'Delete',
          'value': 'DELETE',
        },
        {
          'name': 'View',
          'value': 'VIEW',
        },
      ],
    },
    
    // Project Expenses
    {
      id: 'p6',
      module: 'projectExpenses',
      action: [{
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ]
    },
    
    // Payment Management
    {
      id: 'p7',
      module: 'payment',
      action: [{
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ]
    },
    // Vehicle Management
    {
      id: 'p8', module: 'vehicleManagement', action: [{
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ]
    },
    // User Management
    {
      id: 'p9', module: 'userManagement', action: [{
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ]
    },
    // Subcontractor Management
    {
      id: 'p10', module: 'subcontractorManagement', action: [{
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ]
    },
    // Finance Management
    {
      id: 'p11', module: 'financeManagement', action: [{
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ]
    },
    // Reports Management
    {
      id: 'p12', module: 'reportsManagement', action: [{
        'name': 'Create',
        'value': 'CREATE',
      },
      {
        'name': 'Update',
        'value': 'UPDATE',
      },
      {
        'name': 'Delete',
        'value': 'DELETE',
      },
      {
        'name': 'View',
        'value': 'VIEW',
      },
      ]
    },
  ];


  // Get demo role permissions based on role
  const getDemoRolePermissions = (roleId: string): RolePermission[] => {
    const allPermissions = getDemoPermissions();
    const selectedRole = roles.find(r => r.id === roleId) || getDemoRoles().find(r => r.id === roleId);
    
    if (!selectedRole) return [];

    // Expand permissions to individual action entries
    const expandedAllPermissions: Permission[] = allPermissions.flatMap(permission => {
      if (Array.isArray(permission.action)) {
        return permission.action.map((actionItem: ActionItem) => ({
          ...permission,
          id: `${permission.id}_${actionItem.value}`,
          code: `${permission.module}_${actionItem.value.toLowerCase()}`,
          name: `${permission.module} ${actionItem.name}`,
          action: actionItem.value,
          description: `${actionItem.name} permission for ${permission.module}`
        }));
      } else {
        return [permission];
      }
    });

    // Assign permissions based on role type
    let permissionIds: string[] = [];
    
    if (selectedRole.code === 'COMPANY_ADMIN') {
      // Company Admin gets all permissions
      permissionIds = expandedAllPermissions.map(p => p.id);
    } else if (selectedRole.code === 'PROJECT_MANAGER') {
      // Project Manager gets project, projectExpenses, and view permissions
      permissionIds = expandedAllPermissions
        .filter(p => 
          p.module === 'projectManagement' ||
          p.module === 'projectExpenses' ||
          (p.action === 'VIEW')
        )
        .map(p => p.id);
    } else if (selectedRole.code === 'SITE_SUPERVISOR') {
      // Site Supervisor gets view permissions for most modules
      permissionIds = expandedAllPermissions
        .filter(p => p.action === 'VIEW')
        .map(p => p.id);
    } else if (selectedRole.code === 'ACCOUNTANT') {
      // Accountant gets payment, projectExpenses, and view permissions
      permissionIds = expandedAllPermissions
        .filter(p => 
          p.module === 'payment' ||
          p.module === 'projectExpenses' ||
          (p.action === 'VIEW')
        )
        .map(p => p.id);
    } else {
      // Default: only view permissions
      permissionIds = expandedAllPermissions
        .filter(p => p.action === 'VIEW')
        .map(p => p.id);
    }

    return permissionIds.map(permissionId => {
      const permission = expandedAllPermissions.find(p => p.id === permissionId);
      return {
        roleId: roleId,
        permissionId: permissionId,
        permission: permission!
      };
    }).filter(rp => rp.permission);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedRole) return;

    const isAssigned = rolePermissions.some(rp => rp.permissionId === permissionId);
    
    if (isAssigned) {
      // Remove permission
      setRolePermissions(prev => prev.filter(rp => rp.permissionId !== permissionId));
    } else {
      // Add permission
      const permission = permissions.find(p => p.id === permissionId);
      if (permission) {
        setRolePermissions(prev => [...prev, {
          roleId: selectedRole.id,
          permissionId: permissionId,
          permission: permission
        }]);
      }
    }
  };


  // Transform permissions: expand action arrays into individual permission entries
  const expandedPermissions: Permission[] = permissions.flatMap(permission => {
    if (Array.isArray(permission.action)) {
      // If action is an array, create individual permissions for each action
      return permission.action.map((actionItem: ActionItem) => ({
        ...permission,
        id: `${permission.id}_${actionItem.value}`,
        code: `${permission.module}_${actionItem.value.toLowerCase()}`,
        name: `${permission.module} ${actionItem.name}`,
        action: actionItem.value,
        description: `${actionItem.name} permission for ${permission.module}`
      }));
      } else {
      // If action is a string, keep as is
      return [permission];
    }
  });

  // Group permissions by module
  const groupedPermissions: ModulePermissions[] = expandedPermissions.reduce((acc, permission) => {
    const existingModule = acc.find(m => m.module === permission.module);
    if (existingModule) {
      existingModule.permissions.push(permission);
    } else {
      acc.push({
        module: permission.module,
        permissions: [permission]
      });
    }
    return acc;
  }, [] as ModulePermissions[]);


  const isPermissionAssigned = (permissionId: string) => {
    return rolePermissions.some(rp => rp.permissionId === permissionId);
  };



  // Filter roles based on search term
  const filteredRoles = roles.filter(role => {
    const searchLower = searchTerm.toLowerCase();
    return (
      role.name.toLowerCase().includes(searchLower) ||
      role.code.toLowerCase().includes(searchLower) ||
      (role.description && role.description.toLowerCase().includes(searchLower))
    );
  });

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-success' : 'bg-secondary'}>
        {isActive ? t('RolePermissions.active') : t('RolePermissions.inactive')}
      </Badge>
    );
  };

  // View role handler
  const handleViewRole = (role: Role) => {
    setSelectedRoleForAction(role);
    setViewRoleModalOpen(true);
  };

  // Edit role handler
  const handleEditRole = (role: Role) => {
    setSelectedRoleForAction(role);
    setEditRoleFormData({ ...role });
    setEditRoleModalOpen(true);
  };

  // Delete role handler
  const handleDeleteRole = (role: Role) => {
    setSelectedRoleForAction(role);
    setDeleteRoleModalOpen(true);
  };

  // Confirm delete
  const confirmDeleteRole = () => {
    if (selectedRoleForAction) {
      setRoles(prev => prev.filter(role => role.id !== selectedRoleForAction.id));
      // If deleted role was selected, clear selection
      if (selectedRole?.id === selectedRoleForAction.id) {
        setSelectedRole(null);
      }
      showSuccessToast(t('Roles.roleDeletedSuccessfully'));
      setDeleteRoleModalOpen(false);
      setSelectedRoleForAction(null);
    }
  };

  // Handle edit form input change
  const handleEditRoleInputChange = (field: keyof Role, value: string | boolean) => {
    if (editRoleFormData) {
      setEditRoleFormData({
        ...editRoleFormData,
        [field]: value,
      });
    }
  };

  // Save edit
  const handleSaveEditRole = () => {
    if (editRoleFormData) {
      setRoles(prev => prev.map(role => 
        role.id === editRoleFormData.id ? editRoleFormData : role
      ));
      // Update selectedRole if it was the edited role
      if (selectedRole?.id === editRoleFormData.id) {
        setSelectedRole(editRoleFormData);
      }
      showSuccessToast(t('Roles.roleUpdatedSuccessfully'));
      setEditRoleModalOpen(false);
      setEditRoleFormData(null);
      setSelectedRoleForAction(null);
    }
  };

  return (
    <>
      <Breadcrumbs title={t('RolePermissions.title')} breadcrumbItem={t('RolePermissions.title')} />
      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <InputGroup className="search-input-group">
                  <Input
                    type="text"
                    placeholder={t('Common.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Button
                  color="primary"
                  className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                  onClick={() => setCreatePermissionModalOpen(true)}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <i className="bx bx-plus me-1"></i>
                  {t('RolePermissions.newPermission')}
                </Button>
              </div>
              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('Roles.roleName')}</th>
                      <th>{t('RolePermissions.table.permission')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('Common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => (
                        <tr 
                          key={role.id}
                          style={{ transition: 'background-color 0.2s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td>
                            <h5 className="mb-0 font-size-14">{role.name}</h5>
                            <small className="text-muted">code: {role.code}</small>
                          </td>
                          <td>
                           <div className="d-flex gap-2 flex-wrap">
                           <Badge className="bg-gray">
                              dashboard [View]
                            </Badge>
                            <Badge className="bg-gray">Staff Management [Create, Update, Delete, View]</Badge>
                            <Badge className="bg-gray">Client Management [Create, Update, Delete, View]</Badge>
                            <Badge className="bg-gray">Supplier Management [Create, Update, Delete, View]</Badge>
                            <Badge className="bg-gray">Project Management [Create, Update, Delete, View]</Badge>
                            <Badge className="bg-gray">Vehicle Management [Create, Update, Delete, View]</Badge>
                            <Badge className="bg-gray">User Management [Create, Update, Delete, View]</Badge>
                            <Badge className="bg-gray">Subcontractor Management [Create, Update, Delete, View]</Badge>
                            <Badge className="bg-gray">Finance Management [Create, Update, Delete, View]</Badge>
                           </div>
                          </td>
                          <td>
                          {getStatusBadge(role.isActive)}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                color="outline-primary"
                                className="p-1 border-0"
                                title={t('Common.view')}
                                onClick={() => handleViewRole(role)}
                                style={{ transition: 'all 0.2s ease' }}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button
                                color="outline-success"
                                className="p-1 border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEditRole(role)}
                                style={{ transition: 'all 0.2s ease' }}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="p-1 border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDeleteRole(role)}
                                style={{ transition: 'all 0.2s ease' }}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          <p className="text-muted mb-0">{t('Roles.noRolesFound')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Role Selection and Permissions Management */}


      {/* Create Permission Modal */}
      <Modal isOpen={createPermissionModalOpen} toggle={() => setCreatePermissionModalOpen(!createPermissionModalOpen)} size="xl" centered>
        <ModalHeader toggle={() => setCreatePermissionModalOpen(!createPermissionModalOpen)}>
          {t('RolePermissions.modal.createPermission')}
        </ModalHeader>
        <ModalBody>

              <div className="mb-4">
                <Label className="form-label fw-semibold mb-3">
                  {t('RolePermissions.selectRole')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={selectedRole?.id || ''}
                  onChange={(e) => {
                    const role = roles.find(r => r.id === e.target.value);
                    setSelectedRole(role || null);
                  }}
                >
                  <option value="">{t('RolePermissions.selectRolePlaceholder')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.code})
                    </option>
                  ))}
                </Input>
              </div>

          {selectedRole ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">{t('RolePermissions.permissionsFor')} {selectedRole.name}</h5>
                      <p className="text-muted mb-0">
                        <code className="text-primary">{selectedRole.code}</code>
                        {selectedRole.description && ` - ${selectedRole.description}`}
                      </p>
                      <p className="text-muted mb-0 mt-2">
                        <Badge className="bg-info me-2">
                          {rolePermissions.length} {t('RolePermissions.permissionsSelected')} / {permissions.length} {t('RolePermissions.totalPermissions')}
                        </Badge>
                      </p>
                    </div>
                  </div>

              <Table className="table-nowrap align-middle mb-0" style={{ transition: 'opacity 0.3s ease' }}>
                <thead className="table-light">
                  <tr>
                    <th>{t('RolePermissions.table.module')}</th>
                    <th>{t('RolePermissions.table.all')}</th>
                    <th>{t('RolePermissions.actions.manage')}</th>
                    <th>{t('RolePermissions.actions.create')}</th>
                    <th>{t('RolePermissions.actions.update')}</th>
                    <th>{t('RolePermissions.actions.delete')}</th>
                    <th>{t('RolePermissions.actions.view')}</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedPermissions.map((moduleGroup) => {
                    // Get permissions for each action type
                    const managePermission = moduleGroup.permissions.find(p => p.action === 'MANAGE');
                    const createPermission = moduleGroup.permissions.find(p => p.action === 'CREATE');
                    const updatePermission = moduleGroup.permissions.find(p => p.action === 'UPDATE');
                    const deletePermission = moduleGroup.permissions.find(p => p.action === 'DELETE');
                    const viewPermission = moduleGroup.permissions.find(p => p.action === 'VIEW');

                    return (
                      <tr 
                        key={moduleGroup.module}
                        style={{ transition: 'background-color 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td>
                          <h6 className="mb-0">
                            <i className="mdi mdi-folder-outline me-2"></i>
                            {t(`RolePermissions.modules.${moduleGroup.module}`) || moduleGroup.module}
                          </h6>
                        </td>
                        <td>
                          <Input
                            type="checkbox"
                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            />
                         
                        </td>
                        <td>
                          {managePermission ? (
                            <Input
                              type="checkbox"
                              checked={isPermissionAssigned(managePermission.id)}
                              onChange={() => handlePermissionToggle(managePermission.id)}
                              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {createPermission ? (
                            <Input
                              type="checkbox"
                              checked={isPermissionAssigned(createPermission.id)}
                              onChange={() => handlePermissionToggle(createPermission.id)}
                              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {updatePermission ? (
                            <Input
                              type="checkbox"
                              checked={isPermissionAssigned(updatePermission.id)}
                              onChange={() => handlePermissionToggle(updatePermission.id)}
                              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {deletePermission ? (
                            <Input
                              type="checkbox"
                              checked={isPermissionAssigned(deletePermission.id)}
                              onChange={() => handlePermissionToggle(deletePermission.id)}
                              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {viewPermission ? (
                            <Input
                              type="checkbox"
                              checked={isPermissionAssigned(viewPermission.id)}
                              onChange={() => handlePermissionToggle(viewPermission.id)}
                              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-center py-5">
              <i className="mdi mdi-shield-account-outline" style={{ fontSize: '48px', color: '#6c757d' }}></i>
              <p className="text-muted mt-3">{t('RolePermissions.selectRoleToManage')}</p>
            </div>
          )}

        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => {
            setCreatePermissionModalOpen(false);
            setNewPermission({ code: '', name: '', module: '', action: '', description: '' });
          }}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={() => {
            if (newPermission.name && newPermission.code && newPermission.module && newPermission.action) {
              const permission: Permission = {
                id: `p${Date.now()}`,
                ...newPermission
              };
              setPermissions(prev => [...prev, permission]);
              showSuccessToast(t('RolePermissions.permissionCreatedSuccessfully') || 'Permission created successfully');
              setCreatePermissionModalOpen(false);
              setNewPermission({ code: '', name: '', module: '', action: '', description: '' });
            } else {
              showSuccessToast(t('RolePermissions.fillAllRequiredFields') || 'Please fill all required fields');
            }
          }}>
            <i className="mdi mdi-content-save me-1"></i>
            {t('Common.save')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Role Modal */}
      <Modal isOpen={viewRoleModalOpen} toggle={() => setViewRoleModalOpen(!viewRoleModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setViewRoleModalOpen(!viewRoleModalOpen)}>
          {t('Roles.modal.roleDetails')}
        </ModalHeader>
        <ModalBody>
          {selectedRoleForAction && (
            <div className="row m-0">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Roles.roleName')}</label>
                <p className="mb-0">{selectedRoleForAction.name}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Roles.roleCode')}</label>
                <p className="mb-0">
                  <Badge className="bg-info">{selectedRoleForAction.code}</Badge>
                </p>
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Roles.description')}</label>
                <p className="mb-0">{selectedRoleForAction.description || '-'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>{getStatusBadge(selectedRoleForAction.isActive)}</div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setViewRoleModalOpen(false)}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={editRoleModalOpen} toggle={() => setEditRoleModalOpen(!editRoleModalOpen)} size="md" centered>
        <ModalHeader toggle={() => setEditRoleModalOpen(!editRoleModalOpen)}>
          {t('Roles.editRole')}
        </ModalHeader>
        <ModalBody>
          {editRoleFormData && (
            <div className="row m-0">
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('Roles.labels.roleName')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editRoleFormData.name}
                  onChange={(e) => handleEditRoleInputChange('name', e.target.value)}
                  placeholder={t('Roles.enterRoleName')}
                  maxLength={100}
                />
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('Roles.labels.roleCode')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editRoleFormData.code}
                  onChange={(e) => handleEditRoleInputChange('code', e.target.value.toUpperCase())}
                  placeholder={t('Roles.enterRoleCode')}
                  maxLength={50}
                />
                <small className="text-muted">
                  {t('Roles.codeHint')}
                </small>
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('Roles.labels.description')}</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={editRoleFormData.description || ''}
                  onChange={(e) => handleEditRoleInputChange('description', e.target.value)}
                  placeholder={t('Roles.enterDescription')}
                />
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('Common.status')}</Label>
                <Input
                  type="select"
                  value={editRoleFormData.isActive ? 'true' : 'false'}
                  onChange={(e) => handleEditRoleInputChange('isActive', e.target.value === 'true')}
                >
                  <option value="true">{t('Roles.statusActive')}</option>
                  <option value="false">{t('Roles.statusInactive')}</option>
                </Input>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveEditRole}>
            {t('Common.save')}
          </Button>
          <Button color="secondary" onClick={() => setEditRoleModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteRoleModalOpen} toggle={() => setDeleteRoleModalOpen(!deleteRoleModalOpen)} centered>
        <ModalHeader toggle={() => setDeleteRoleModalOpen(!deleteRoleModalOpen)}>
          {t('Common.confirmDelete')}
        </ModalHeader>
        <ModalBody>
          {selectedRoleForAction && (
            <p>
              {t('Roles.deleteConfirmation') || 'Are you sure you want to delete this role?'}
              <br />
              <strong>{selectedRoleForAction.name} ({selectedRoleForAction.code})</strong>
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmDeleteRole}>
            {t('Common.delete')}
          </Button>
          <Button color="secondary" onClick={() => setDeleteRoleModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default RolePermissions;

