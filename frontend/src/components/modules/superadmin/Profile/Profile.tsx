/**
 * @author Auto-generated
 * Profile component for Super Admin
 * This component displays and allows editing of the super admin profile
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardBody, 
  Row, 
  Col, 
  Button, 
  Label, 
  Input, 
  FormFeedback,
  Badge
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { showSuccessToast, showErrorToast } from '../../../../core/utils/toast';
import { validateEmail, validatePhone } from '../../../../core/utils/Utils';
import LoginService from '../../../../core/service/LoginService';
import user1 from '../../../../assets/images/users/avatar-1.jpg';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  profilePhoto?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Super Admin',
  });
  const [editFormData, setEditFormData] = useState<ProfileData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Super Admin',
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [profilePhoto, setProfilePhoto] = useState<string>(user1);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await LoginService.getProfile();
      if (response?.data) {
        const userData = response.data;
        const profile: ProfileData = {
          id: userData.id || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'Super Admin',
          profilePhoto: userData.profilePhoto,
        };
        setProfileData(profile);
        setEditFormData(profile);
        if (userData.profilePhoto) {
          setProfilePhoto(userData.profilePhoto);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // For now, use dummy data if API fails
      const dummyProfile: ProfileData = {
        id: '1',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@joorapp.com',
        phone: '+1234567890',
        role: 'Super Admin',
      };
      setProfileData(dummyProfile);
      setEditFormData(dummyProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditFormData({ ...profileData });
    setFormErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData({ ...profileData });
    setFormErrors({});
  };

  const validateEditForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!editFormData.firstName.trim()) {
      errors.firstName = t('Profile.firstNameRequired') || 'First name is required';
    }

    if (!editFormData.lastName.trim()) {
      errors.lastName = t('Profile.lastNameRequired') || 'Last name is required';
    }

    if (!editFormData.email.trim()) {
      errors.email = t('Profile.emailRequired') || 'Email is required';
    } else if (!validateEmail(editFormData.email)) {
      errors.email = t('Profile.emailInvalid') || 'Please enter a valid email address';
    }

    if (editFormData.phone && !validatePhone(editFormData.phone)) {
      errors.phone = t('Profile.phoneInvalid') || 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      // TODO: Implement API call to update profile
      // await UserService.updateProfile(editFormData);
      
      setProfileData({ ...editFormData });
      setIsEditing(false);
      showSuccessToast(t('Profile.profileUpdatedSuccessfully') || 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast(t('Profile.profileUpdateFailed') || 'Failed to update profile');
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handlePasswordInputChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validatePasswordForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = t('Profile.currentPasswordRequired') || 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = t('Profile.newPasswordRequired') || 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = t('Profile.passwordMinLength') || 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = t('Profile.confirmPasswordRequired') || 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = t('Profile.passwordsDoNotMatch') || 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = t('Profile.newPasswordMustBeDifferent') || 'New password must be different from current password';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      // TODO: Implement API call to change password
      // await UserService.changePassword(passwordData);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
      showSuccessToast(t('Profile.passwordChangedSuccessfully') || 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      showErrorToast(t('Profile.passwordChangeFailed') || 'Failed to change password');
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setFormErrors({});
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showErrorToast(t('Profile.invalidFileType') || 'Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast(t('Profile.fileTooLarge') || 'File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Implement API call to upload profile photo
      // await UserService.uploadProfilePhoto(file);
      showSuccessToast(t('Profile.profilePhotoUpdated') || 'Profile photo updated successfully');
    }
  };

  const getFullName = (): string => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    if (profileData.firstName) {
      return profileData.firstName;
    }
    if (profileData.lastName) {
      return profileData.lastName;
    }
    return profileData.email;
  };

  if (isLoading) {
    return (
      <>
        <Breadcrumbs title={t('Navigation.profile')} breadcrumbItem={t('Navigation.profile')} />
        <Card>
          <CardBody>
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs title={t('Navigation.profile')} breadcrumbItem={t('Navigation.profile')} />

      <Row>
        <Col lg="4">
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="position-relative d-inline-block mb-4">
                  <div className="avatar-lg">
                    <div className="avatar-title rounded-circle bg-light">
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="avatar-md rounded-circle"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  <div className="avatar-xs position-absolute bottom-0 end-0">
                    <label
                      htmlFor="profile-photo-upload"
                      className="avatar-title rounded-circle bg-primary cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="bx bx-camera font-size-16"></i>
                    </label>
                    <input
                      type="file"
                      id="profile-photo-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
                <h5 className="mb-1">{getFullName()}</h5>
                <p className="text-muted">{profileData.email}</p>
                <Badge className="bg-danger">{profileData.role}</Badge>
              </div>

              <div className="mt-4">
                <h5 className="font-size-14 mb-3">{t('Profile.personalInformation') || 'Personal Information'}</h5>
                <div className="table-responsive">
                  <table className="table table-nowrap mb-0">
                    <tbody>
                      <tr>
                        <th scope="row">{t('Profile.firstName') || 'First Name'}:</th>
                        <td>{profileData.firstName || '-'}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('Profile.lastName') || 'Last Name'}:</th>
                        <td>{profileData.lastName || '-'}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('Profile.email') || 'Email'}:</th>
                        <td>{profileData.email}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('Profile.phone') || 'Phone'}:</th>
                        <td>{profileData.phone || '-'}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('Profile.role') || 'Role'}:</th>
                        <td>
                          <Badge className="bg-danger">{profileData.role}</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg="8">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">{t('Profile.profileSettings') || 'Profile Settings'}</h4>
                {!isEditing && (
                  <Button color="primary" onClick={handleEdit}>
                    <i className="bx bx-edit me-1"></i>
                    {t('Profile.editProfile') || 'Edit Profile'}
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">
                          {t('Profile.firstName') || 'First Name'} <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="text"
                          className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`}
                          value={editFormData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder={t('Profile.enterFirstName') || 'Enter first name'}
                        />
                        {formErrors.firstName && <FormFeedback>{formErrors.firstName}</FormFeedback>}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">
                          {t('Profile.lastName') || 'Last Name'} <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="text"
                          className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`}
                          value={editFormData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder={t('Profile.enterLastName') || 'Enter last name'}
                        />
                        {formErrors.lastName && <FormFeedback>{formErrors.lastName}</FormFeedback>}
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">
                          {t('Profile.email') || 'Email'} <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="email"
                          className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                          value={editFormData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={t('Profile.enterEmail') || 'Enter email address'}
                        />
                        {formErrors.email && <FormFeedback>{formErrors.email}</FormFeedback>}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">{t('Profile.phone') || 'Phone'}</Label>
                        <Input
                          type="text"
                          className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                          value={editFormData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder={t('Profile.enterPhone') || 'Enter phone number'}
                        />
                        {formErrors.phone && <FormFeedback>{formErrors.phone}</FormFeedback>}
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2">
                    <Button color="primary" onClick={handleSave}>
                      <i className="bx bx-save me-1"></i>
                      {t('Profile.saveChanges') || 'Save Changes'}
                    </Button>
                    <Button color="secondary" onClick={handleCancel}>
                      {t('Profile.cancel') || 'Cancel'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">{t('Profile.firstName') || 'First Name'}</Label>
                        <Input type="text" className="form-control" value={profileData.firstName || ''} disabled />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">{t('Profile.lastName') || 'Last Name'}</Label>
                        <Input type="text" className="form-control" value={profileData.lastName || ''} disabled />
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">{t('Profile.email') || 'Email'}</Label>
                        <Input type="email" className="form-control" value={profileData.email} disabled />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">{t('Profile.phone') || 'Phone'}</Label>
                        <Input type="text" className="form-control" value={profileData.phone || ''} disabled />
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">{t('Profile.changePassword') || 'Change Password'}</h4>
                {!isChangingPassword && (
                  <Button color="primary" outline onClick={() => setIsChangingPassword(true)}>
                    <i className="bx bx-lock me-1"></i>
                    {t('Profile.changePassword') || 'Change Password'}
                  </Button>
                )}
              </div>

              {isChangingPassword ? (
                <div>
                  <div className="mb-3">
                    <Label className="form-label">
                      {t('Profile.currentPassword') || 'Current Password'} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="password"
                      className={`form-control ${formErrors.currentPassword ? 'is-invalid' : ''}`}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      placeholder={t('Profile.enterCurrentPassword') || 'Enter current password'}
                    />
                    {formErrors.currentPassword && <FormFeedback>{formErrors.currentPassword}</FormFeedback>}
                  </div>

                  <div className="mb-3">
                    <Label className="form-label">
                      {t('Profile.newPassword') || 'New Password'} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="password"
                      className={`form-control ${formErrors.newPassword ? 'is-invalid' : ''}`}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      placeholder={t('Profile.enterNewPassword') || 'Enter new password'}
                    />
                    {formErrors.newPassword && <FormFeedback>{formErrors.newPassword}</FormFeedback>}
                  </div>

                  <div className="mb-3">
                    <Label className="form-label">
                      {t('Profile.confirmPassword') || 'Confirm Password'} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="password"
                      className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      placeholder={t('Profile.enterConfirmPassword') || 'Confirm new password'}
                    />
                    {formErrors.confirmPassword && <FormFeedback>{formErrors.confirmPassword}</FormFeedback>}
                  </div>

                  <div className="d-flex gap-2">
                    <Button color="primary" onClick={handleChangePassword}>
                      <i className="bx bx-save me-1"></i>
                      {t('Profile.updatePassword') || 'Update Password'}
                    </Button>
                    <Button color="secondary" onClick={handleCancelPasswordChange}>
                      {t('Profile.cancel') || 'Cancel'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-0">
                  {t('Profile.passwordChangeDescription') || 'Click the button above to change your password. Make sure to use a strong password.'}
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Profile;

