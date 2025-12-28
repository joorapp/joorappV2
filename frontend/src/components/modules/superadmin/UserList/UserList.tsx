import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Button, Badge, Input, InputGroup, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'company',
    password: '',
  });
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'company',
  });

  // Mock data for users
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234-567-8900',
      role: 'superadmin',
      status: 'Active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      lastLogin: '2024-12-20T09:15:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 234-567-8901',
      role: 'company',
      status: 'Active',
      createdAt: '2024-02-10T09:15:00Z',
      updatedAt: '2024-02-15T11:45:00Z',
      lastLogin: '2024-12-19T16:30:00Z',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 234-567-8902',
      role: 'company',
      status: 'Inactive',
      createdAt: '2024-03-15T12:30:00Z',
      updatedAt: '2024-03-20T15:45:00Z',
      lastLogin: '2024-11-10T10:20:00Z',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 234-567-8903',
      role: 'company',
      status: 'Active',
      createdAt: '2024-04-15T13:15:00Z',
      updatedAt: '2024-04-20T16:30:00Z',
      lastLogin: '2024-12-20T08:45:00Z',
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '+1 234-567-8904',
      role: 'company',
      status: 'Active',
      createdAt: '2024-05-15T14:00:00Z',
      updatedAt: '2024-05-20T17:15:00Z',
      lastLogin: '2024-12-19T14:20:00Z',
    },
    {
      id: '6',
      name: 'Sarah Brown',
      email: 'sarah.brown@example.com',
      phone: '+1 234-567-8905',
      role: 'company',
      status: 'Pending',
      createdAt: '2024-06-10T11:30:00Z',
      updatedAt: '2024-06-10T11:30:00Z',
    },
  ]);

  // Get initials from user name
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color based on name
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-info',
      'bg-warning',
      'bg-danger',
      'bg-secondary',
      'bg-dark',
      'bg-pink',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-success">{t('UserList.statusActive')}</Badge>;
      case 'Pending':
        return <Badge className="bg-warning">{t('UserList.statusPending')}</Badge>;
      case 'Inactive':
        return <Badge className="bg-danger">{t('UserList.statusInactive')}</Badge>;
      default:
        return <Badge className="bg-secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-danger">{t('UserList.roleSuperAdmin')}</Badge>;
      case 'company':
        return <Badge className="bg-primary">{t('UserList.roleCompany')}</Badge>;
      default:
        return <Badge className="bg-secondary">{role}</Badge>;
    }
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password) {
      alert(t('UserList.fillAllFields'));
      return;
    }

    const user: User = {
      id: String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'company',
      password: '',
    });
    setCreateModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditUser(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editUser.name || !editUser.email || !editUser.phone) {
      alert(t('UserList.fillAllFields'));
      return;
    }

    setUsers(users.map(user =>
      user.id === editingUser.id
        ? {
          ...user,
          name: editUser.name,
          email: editUser.email,
          phone: editUser.phone,
          role: editUser.role,
          updatedAt: new Date().toISOString()
        }
        : user
    ));

    setEditModalOpen(false);
    setEditingUser(null);
    setEditUser({
      name: '',
      email: '',
      phone: '',
      role: 'company',
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <>
      <div className="page-content">
        <Breadcrumbs title={t('Navigation.userLists')} breadcrumbItem={t('Navigation.userLists')} />
        
        <Row>
          <Col xs={12}>
            <Card>
              <CardBody>
                <Row className="mb-3">
                  <Col md={6}>
                    <InputGroup className="search-input-group">
                      <Input
                        type="text"
                        placeholder={t('UserList.searchUsers')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button color="primary">
                        <i className="mdi mdi-magnify"></i>
                      </Button>
                    </InputGroup>
                  </Col>
                  <Col md={6} className="text-end">
                    <Button
                      color="primary"
                      onClick={() => setCreateModalOpen(true)}
                    >
                      <i className="mdi mdi-plus me-1"></i>
                      {t('UserList.createUser')}
                    </Button>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <Table className="table-nowrap align-middle mb-0">
                    <thead>
                      <tr>
                        <th>{t('UserList.user')}</th>
                        <th>{t('UserList.email')}</th>
                        <th>{t('UserList.phone')}</th>
                        <th>{t('UserList.role')}</th>
                        <th>{t('UserList.status')}</th>
                        <th>{t('UserList.lastLogin')}</th>
                        <th>{t('UserList.action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center">
                            {t('UserList.noUsersFound')}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className={`avatar-sm me-3 ${getAvatarColor(user.name)} rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold`}>
                                  {getInitials(user.name)}
                                </div>
                                <div>
                                  <h5 className="mb-0 font-size-14">{user.name}</h5>
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '-'}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setModalOpen(true);
                                  }}
                                >
                                  <i className="mdi mdi-eye"></i>
                                </Button>
                                <Button
                                  color="warning"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <i className="mdi mdi-pencil"></i>
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <i className="mdi mdi-delete"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* View User Modal */}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          {t('UserList.userDetails')}
        </ModalHeader>
        <ModalBody>
          {selectedUser && (
            <Row>
              <div className="col-12 mb-3">
                <div className="d-flex align-items-center">
                  <div className={`avatar-lg me-3 ${getAvatarColor(selectedUser.name)} rounded-circle d-flex align-items-center justify-content-center text-white fw-bold`}>
                    {getInitials(selectedUser.name)}
                  </div>
                  <div>
                    <h5 className="mb-2">{selectedUser.name}</h5>
                    <p className="text-muted mb-0">{getRoleBadge(selectedUser.role)}</p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <hr />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('UserList.email')}</label>
                <p className="mb-0">{selectedUser.email}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('UserList.phone')}</label>
                <p className="mb-0">{selectedUser.phone}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('UserList.role')}</label>
                <div>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('UserList.status')}</label>
                <div>
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('UserList.createdAt')}</label>
                <p className="mb-0">
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('UserList.lastLogin')}</label>
                <p className="mb-0">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </p>
              </div>
            </Row>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        toggle={() => setCreateModalOpen(!createModalOpen)}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setCreateModalOpen(!createModalOpen)}>
          {t('UserList.createUser')}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>{t('UserList.name')}</Label>
            <Input
              type="text"
              value={newUser.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('UserList.enterName')}
            />
          </div>
          <div className="mb-3">
            <Label>{t('UserList.email')}</Label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('UserList.enterEmail')}
            />
          </div>
          <div className="mb-3">
            <Label>{t('UserList.phone')}</Label>
            <Input
              type="tel"
              value={newUser.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('UserList.enterPhone')}
            />
          </div>
          <div className="mb-3">
            <Label>{t('UserList.role')}</Label>
            <Input
              type="select"
              value={newUser.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <option value="company">{t('UserList.roleCompany')}</option>
              <option value="superadmin">{t('UserList.roleSuperAdmin')}</option>
            </Input>
          </div>
          <div className="mb-3">
            <Label>{t('UserList.password')}</Label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={t('UserList.enterPassword')}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCreateModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleCreateUser}>
            {t('UserList.createUser')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        toggle={() => setEditModalOpen(!editModalOpen)}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          {t('UserList.editUser')}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>{t('UserList.name')}</Label>
            <Input
              type="text"
              value={editUser.name}
              onChange={(e) => handleEditInputChange('name', e.target.value)}
              placeholder={t('UserList.enterName')}
            />
          </div>
          <div className="mb-3">
            <Label>{t('UserList.email')}</Label>
            <Input
              type="email"
              value={editUser.email}
              onChange={(e) => handleEditInputChange('email', e.target.value)}
              placeholder={t('UserList.enterEmail')}
            />
          </div>
          <div className="mb-3">
            <Label>{t('UserList.phone')}</Label>
            <Input
              type="tel"
              value={editUser.phone}
              onChange={(e) => handleEditInputChange('phone', e.target.value)}
              placeholder={t('UserList.enterPhone')}
            />
          </div>
          <div className="mb-3">
            <Label>{t('UserList.role')}</Label>
            <Input
              type="select"
              value={editUser.role}
              onChange={(e) => handleEditInputChange('role', e.target.value)}
            >
              <option value="company">{t('UserList.roleCompany')}</option>
              <option value="superadmin">{t('UserList.roleSuperAdmin')}</option>
            </Input>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleUpdateUser}>
            {t('UserList.updateUser')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen(!deleteModalOpen)}
        centered
      >
        <ModalHeader toggle={() => setDeleteModalOpen(!deleteModalOpen)}>
          {t('UserList.confirmDelete')}
        </ModalHeader>
        <ModalBody className="text-center">
          <div className="delete-confirm-icon mb-3">
            <i className="mdi mdi-alert-circle"></i>
          </div>
          <h5>{t('UserList.areYouSure')}</h5>
          <p className="text-muted">
            {t('UserList.deleteConfirmation')} <strong>{userToDelete?.name}</strong>?
          </p>
          <p className="text-muted small">{t('UserList.cannotBeUndone')}</p>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
          <Button color="danger" onClick={handleConfirmDelete}>
            {t('Common.delete')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserList;

