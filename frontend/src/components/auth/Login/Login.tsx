/**
 * @author Ananthapadmanabhan V K
 * Login component for the application
 * This component is the login page for the application
 * @returns Login component with formik, validation schema, error, isSubmitting, handleSubmit, handleDemoLogin
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginService from '../../../core/service/LoginService';
import { useCompanies } from '../../../context/CompaniesContext';
import { useAuth } from '../../../context/AuthContext';
import { Container, Row, Col, Card, CardBody, Alert, Input, Label, Form, FormFeedback } from 'reactstrap';

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

import profile from '../../../assets/images/profile-img.png';
import logo from '../../../assets/images/Icon.png';
import lightlogo from '../../../assets/images/logo-light.svg';



const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCompanies } = useCompanies();
  const { setUser, isAuthenticated, user, isLoading } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already authenticated (has accessToken)
  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    // Check if user is authenticated via context
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') {
        navigate('/superadmin', { replace: true });
      } else {
        navigate('/company', { replace: true });
      }
      return;
    }

    // Additional check: if accessToken exists in localStorage, redirect
    // This handles cases where token exists but context hasn't loaded yet
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isLoading) {
      // Check role from localStorage
      const keycloakRole = localStorage.getItem('keycloak_global_role');
      if (keycloakRole === 'SUPER_ADMIN') {
        navigate('/superadmin', { replace: true });
      } else {
        navigate('/company', { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Yup validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .required(t('Login.validation.emailRequired'))
      .email(t('Login.validation.emailInvalid')),
    password: Yup.string()
      .required(t('Login.validation.passwordRequired')),
    rememberMe: Yup.boolean()
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setIsSubmitting(true);

      try {
        // Call LoginService following API architecture pattern
        const response = await LoginService.login({
          email: values.email,
          password: values.password,
        });
        // Handle successful login response
        if (response.data?.success && response.data?.data) {
          const { access_token, refresh_token, companies, keycloak_global_role } = response.data.data;

          if (access_token && refresh_token) {
            // Store tokens separately in localStorage
            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            
            // Store keycloak_global_role in localStorage
            if (keycloak_global_role) {
              localStorage.setItem('keycloak_global_role', keycloak_global_role);
            }
            
            // Store companies from login response (companies are included in the response)
            if (companies && Array.isArray(companies) && companies.length > 0) {
              setCompanies(companies);

              // Select first company and get user data
              try {
                const companyId = companies[0].id;
                const selectResponse = await LoginService.selectCompany(companyId);
                
                if (selectResponse.data?.success && selectResponse.data?.data?.user) {
                  // Map keycloak_global_role to user role and save user to context
                  const userData = {
                    ...selectResponse.data.data.user,
                    role: keycloak_global_role === 'SUPER_ADMIN' ? 'superadmin' : 'company' as const,
                  };
                  setUser(userData);
                }

                // Route based on keycloak_global_role after company selection
                if (keycloak_global_role === 'SUPER_ADMIN') {
                  navigate('/superadmin');
                } else {
                  navigate('/company');
                }
              } catch (selectError) {
                // Interceptor already shows error toast, continue with login
                // User will be set from profile API on next page load if needed
                // Route based on keycloak_global_role even if selectCompany fails
                if (keycloak_global_role === 'SUPER_ADMIN') {
                  navigate('/superadmin');
                } else {
                  navigate('/company');
                }
              }
            } else {
              // No companies, route based on role
              if (keycloak_global_role === 'SUPER_ADMIN') {
                navigate('/superadmin');
              } else {
                navigate('/company');
              }
            }

            // Store remember me preference
            if (values.rememberMe) {
              localStorage.setItem('rememberMe', 'true');
            } else {
              localStorage.removeItem('rememberMe');
            }
          } else {
            setError(response.data?.message || t('Login.errors.invalidResponse'));
          }
        } else {
          setError(response.data?.message || t('Login.errors.noDataReceived'));
        }
      } catch (err: any) {
        // Error handling - interceptor already shows toast, just set local error state
        const errorMessage = err?.response?.data?.message || 
                           err?.response?.data?.error || 
                           err?.message || 
                           t('Login.errors.unexpectedError');
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // const handleDemoLogin = (role: 'superadmin' | 'company') => {
  //   if (role === 'superadmin') {
  //     setFormData({
  //       email: 'superadmin@example.com',
  //       password: 'admin123',
  //       rememberMe: false,
  //     });
  //   } else {
  //     setFormData({
  //       email: 'company@example.com',
  //       password: 'company123',
  //       rememberMe: false,
  //     });
  //   }
  // };


  return (
    <>
   <div className="account-pages_login my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col xs={7}>
                      <div className="text-primary p-4">
                        <h5 className="text-primary">{t('Login.welcomeBack')}</h5>
                        <p>{t('Login.signInToContinue')}</p>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      <img src={profile} alt="" className="img-fluid" />
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div className="auth-logo">
                    <a href="/" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle">
                          <img
                            src={lightlogo}
                            alt=""
                            className="rounded-circle"
                            height="50"
                          />
                        </span>
                      </div>
                    </a>
                    <a href="/" className="auth-logo-dark">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-primary">
                          <img
                            src={logo}
                            alt=""
                            className="rounded-circle"
                            width="50"
                          />
                        </span>
                      </div>
                    </a>
                  </div>
                  <div className="p-2">
                    <Form
                      className="form-horizontal"
                      onSubmit={formik.handleSubmit}
                    >
                      {error ? <Alert color="danger">{error}</Alert> : null}

                      <div className="mb-3">
                        <Label className="form-label">{t('Login.email')}</Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder={t('Login.enterEmail')}
                          type="email"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.email}
                          invalid={formik.touched.email && !!formik.errors.email}
                          required
                          disabled={isSubmitting}
                        />
                        {formik.touched.email && formik.errors.email && (
                          <FormFeedback type="invalid">
                            {formik.errors.email}
                          </FormFeedback>
                        )}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">{t('Login.password')}</Label>
                        <Input
                          name="password"
                          autoComplete="off"
                          value={formik.values.password}
                          type="password"
                          placeholder={t('Login.enterPassword')}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.password && !!formik.errors.password}
                          required
                          disabled={isSubmitting}
                        />
                        {formik.touched.password && formik.errors.password && (
                          <FormFeedback type="invalid">
                            {formik.errors.password}
                          </FormFeedback>
                        )}
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customControlInline"
                          name="rememberMe"
                          checked={formik.values.rememberMe}
                          onChange={formik.handleChange}
                          disabled={isSubmitting}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customControlInline"
                        >
                          {t('Login.rememberMe')}
                        </label>
                      </div>

                      <div className="mt-3 d-grid">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                        >
                          {t('Login.logIn')}
                        </button>
                      </div>



                      <div className="mt-4 text-center">
                        <Link to="/forgot-password" className="text-muted">
                          <i className="mdi mdi-lock me-1" />
                          {t('Login.forgotYourPassword')}
                        </Link>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>

            </Col>
          </Row>
        </Container>
      </div>



    </>
  );
};

export default Login;
