import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Card, CardBody, Col, Input, InputGroup, Row, Table } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';

type PermissionAction = 'MANAGE' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';

type Role = {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
};

type Permission = {
  id: string;
  module: string;
  action: PermissionAction;
};

type RolePermission = {
  roleId: string;
  permissionId: string;
};

const DEMO_ROLES: Role[] = [
  {
    id: 'r1',
    name: 'Company Admin',
    code: 'COMPANY_ADMIN',
    description: 'Full access to company modules',
    isActive: true,
  },
  {
    id: 'r2',
    name: 'Project Manager',
    code: 'PROJECT_MANAGER',
    description: 'Manages projects and project expenses',
    isActive: true,
  },
  {
    id: 'r3',
    name: 'Site Supervisor',
    code: 'SITE_SUPERVISOR',
    description: 'Site operations access (mostly view)',
    isActive: true,
  },
  {
    id: 'r4',
    name: 'Accountant',
    code: 'ACCOUNTANT',
    description: 'Payment and expenses access',
    isActive: true,
  },
];

const MODULES: string[] = [
  'dashboard',
  'staffManagement',
  'clientManagement',
  'supplierManagement',
  'projectManagement',
  'projectExpenses',
  'payment',
  'vehicleManagement',
  'userManagement',
  'subcontractorManagement',
  'financeManagement',
  'reportsManagement',
];

const ACTIONS: PermissionAction[] = ['MANAGE', 'CREATE', 'UPDATE', 'DELETE', 'VIEW'];

const buildDemoPermissions = (): Permission[] => {
  const permissions: Permission[] = [];
  for (const module of MODULES) {
    for (const action of ACTIONS) {
      permissions.push({ id: `${module}_${action}`, module, action });
    }
  }
  return permissions;
};

const buildDemoRolePermissions = (permissions: Permission[]): RolePermission[] => {
  const byId = new Map(permissions.map((p) => [p.id, p]));
  const allPermissionIds = permissions.map((p) => p.id);

  const viewOnlyPermissionIds = permissions.filter((p) => p.action === 'VIEW').map((p) => p.id);
  const pmPermissionIds = permissions
    .filter(
      (p) =>
        p.module === 'projectManagement' ||
        p.module === 'projectExpenses' ||
        p.action === 'VIEW',
    )
    .map((p) => p.id)
    .filter((id) => byId.has(id));

  const accountantPermissionIds = permissions
    .filter((p) => p.module === 'payment' || p.module === 'projectExpenses' || p.action === 'VIEW')
    .map((p) => p.id)
    .filter((id) => byId.has(id));

  const roleToPermissionIds: Record<string, string[]> = {
    COMPANY_ADMIN: allPermissionIds,
    PROJECT_MANAGER: pmPermissionIds,
    SITE_SUPERVISOR: viewOnlyPermissionIds,
    ACCOUNTANT: accountantPermissionIds,
  };

  return DEMO_ROLES.flatMap((role) =>
    (roleToPermissionIds[role.code] || viewOnlyPermissionIds).map((permissionId) => ({
      roleId: role.id,
      permissionId,
    })),
  );
};

const CompanyRolePermissions = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roles] = useState<Role[]>(DEMO_ROLES);
  const [permissions] = useState<Permission[]>(() => buildDemoPermissions());
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(() =>
    buildDemoRolePermissions(buildDemoPermissions()),
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>(DEMO_ROLES[0]?.id || '');

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId],
  );

  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const term = searchTerm.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term)),
    );
  }, [roles, searchTerm]);

  const isPermissionAssigned = (permissionId: string) => {
    if (!selectedRole) return false;
    return rolePermissions.some((rp) => rp.roleId === selectedRole.id && rp.permissionId === permissionId);
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;
    setRolePermissions((prev) => {
      const exists = prev.some((rp) => rp.roleId === selectedRole.id && rp.permissionId === permissionId);
      if (exists) {
        return prev.filter((rp) => !(rp.roleId === selectedRole.id && rp.permissionId === permissionId));
      }
      return [...prev, { roleId: selectedRole.id, permissionId }];
    });
  };

  const groupedByModule = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const list = map.get(p.module) || [];
      list.push(p);
      map.set(p.module, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => ACTIONS.indexOf(a.action) - ACTIONS.indexOf(b.action));
    }
    return Array.from(map.entries()).sort((a, b) => MODULES.indexOf(a[0]) - MODULES.indexOf(b[0]));
  }, [permissions]);

  const selectedCount = useMemo(() => {
    if (!selectedRole) return 0;
    return rolePermissions.filter((rp) => rp.roleId === selectedRole.id).length;
  }, [rolePermissions, selectedRole]);

  return (
    <div className="companyPageContentInner">
      <Breadcrumbs
        title={t('RolePermissions.title')}
        breadcrumbItem={t('RolePermissions.title')}
        breadcrumbParent={t('Navigation.settings')}
        link="/company/employees/role-permissions"
      />

      <Row>
        <Col xl="4" lg="5">
          <Card>
            <CardBody>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">{t('RolePermissions.allRoles')}</h5>
              </div>

              <InputGroup className="search-input-group mb-3">
                <Input
                  type="text"
                  placeholder={t('Common.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              {filteredRoles.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {filteredRoles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      className={`btn text-start w-100 ${role.id === selectedRoleId ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-semibold">{role.name}</div>
                          <div className="small opacity-75">{role.code}</div>
                        </div>
                        <Badge className={role.isActive ? 'bg-success' : 'bg-secondary'}>
                          {role.isActive ? t('RolePermissions.active') : t('RolePermissions.inactive')}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">{t('RolePermissions.noRolesFound')}</div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col xl="8" lg="7">
          <Card>
            <CardBody>
              {!selectedRole ? (
                <div className="text-center py-5 text-muted">{t('RolePermissions.selectRoleToManage')}</div>
              ) : (
                <>
                  <div className="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-2">
                    <div>
                      <h5 className="mb-1">{t('RolePermissions.permissionsFor')} {selectedRole.name}</h5>
                      <div className="text-muted small">
                        <code className="text-primary">{selectedRole.code}</code>
                        {selectedRole.description ? ` - ${selectedRole.description}` : ''}
                      </div>
                    </div>
                    <Badge className="bg-info">
                      {selectedCount} {t('RolePermissions.permissionsSelected')} / {permissions.length} {t('RolePermissions.totalPermissions')}
                    </Badge>
                  </div>

                  <div className="table-responsive">
                    <Table className="table-nowrap align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>{t('RolePermissions.table.module')}</th>
                          <th className="text-center">{t('RolePermissions.actions.manage')}</th>
                          <th className="text-center">{t('RolePermissions.actions.create')}</th>
                          <th className="text-center">{t('RolePermissions.actions.update')}</th>
                          <th className="text-center">{t('RolePermissions.actions.delete')}</th>
                          <th className="text-center">{t('RolePermissions.actions.view')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedByModule.map(([module, modulePermissions]) => {
                          const getPermissionId = (action: PermissionAction) =>
                            modulePermissions.find((p) => p.action === action)?.id;

                          const manageId = getPermissionId('MANAGE');
                          const createId = getPermissionId('CREATE');
                          const updateId = getPermissionId('UPDATE');
                          const deleteId = getPermissionId('DELETE');
                          const viewId = getPermissionId('VIEW');

                          return (
                            <tr key={module}>
                              <td className="fw-medium">
                                {t(`RolePermissions.modules.${module}`)}
                              </td>
                              <td className="text-center">
                                {manageId ? (
                                  <Input type="checkbox" checked={isPermissionAssigned(manageId)} onChange={() => togglePermission(manageId)} />
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td className="text-center">
                                {createId ? (
                                  <Input type="checkbox" checked={isPermissionAssigned(createId)} onChange={() => togglePermission(createId)} />
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td className="text-center">
                                {updateId ? (
                                  <Input type="checkbox" checked={isPermissionAssigned(updateId)} onChange={() => togglePermission(updateId)} />
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td className="text-center">
                                {deleteId ? (
                                  <Input type="checkbox" checked={isPermissionAssigned(deleteId)} onChange={() => togglePermission(deleteId)} />
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td className="text-center">
                                {viewId ? (
                                  <Input type="checkbox" checked={isPermissionAssigned(viewId)} onChange={() => togglePermission(viewId)} />
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyRolePermissions;

