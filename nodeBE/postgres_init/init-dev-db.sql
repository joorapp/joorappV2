--
-- PostgreSQL database dump
--

\restrict ZvPUL9SAdpFSKVxFr1yCOK44snHCIqKHukooxIp9vMlJjh1XzfIY7EzempwNcU9

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_company_context DROP CONSTRAINT IF EXISTS user_company_context_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.demo_auditable_models DROP CONSTRAINT IF EXISTS demo_auditable_models_updated_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.demo_auditable_models DROP CONSTRAINT IF EXISTS demo_auditable_models_deleted_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.demo_auditable_models DROP CONSTRAINT IF EXISTS demo_auditable_models_created_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.demo_auditable_models DROP CONSTRAINT IF EXISTS demo_auditable_models_created_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_updated_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_deleted_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_created_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_created_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_company_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_roles DROP CONSTRAINT IF EXISTS company_roles_updated_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_roles DROP CONSTRAINT IF EXISTS company_roles_deleted_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_roles DROP CONSTRAINT IF EXISTS company_roles_created_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_roles DROP CONSTRAINT IF EXISTS company_roles_created_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_updated_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_deleted_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_created_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_created_company_id_fkey;
DROP INDEX IF EXISTS public.users_keycloak_id_unique;
DROP INDEX IF EXISTS public.users_is_active_idx;
DROP INDEX IF EXISTS public.users_email_unique;
DROP INDEX IF EXISTS public.user_company_context_keycloak_session_id_unique;
DROP INDEX IF EXISTS public.user_company_context_company_id_idx;
DROP INDEX IF EXISTS public.demo_auditable_models_status_idx;
DROP INDEX IF EXISTS public.demo_auditable_models_name_idx;
DROP INDEX IF EXISTS public.demo_auditable_models_is_deleted_idx;
DROP INDEX IF EXISTS public.company_users_user_id_idx;
DROP INDEX IF EXISTS public.company_users_user_company_unique;
DROP INDEX IF EXISTS public.company_users_role_id_idx;
DROP INDEX IF EXISTS public.company_users_is_deleted_idx;
DROP INDEX IF EXISTS public.company_users_is_active_idx;
DROP INDEX IF EXISTS public.company_users_company_id_idx;
DROP INDEX IF EXISTS public.company_roles_name_unique;
DROP INDEX IF EXISTS public.company_roles_is_deleted_idx;
DROP INDEX IF EXISTS public.company_roles_is_active_idx;
DROP INDEX IF EXISTS public.company_roles_code_unique;
DROP INDEX IF EXISTS public.companies_name_unique;
DROP INDEX IF EXISTS public.companies_is_deleted_idx;
DROP INDEX IF EXISTS public.companies_is_active_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_keycloak_id_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_company_context DROP CONSTRAINT IF EXISTS user_company_context_pkey;
ALTER TABLE IF EXISTS ONLY public.user_company_context DROP CONSTRAINT IF EXISTS user_company_context_keycloak_session_id_key;
ALTER TABLE IF EXISTS ONLY public.demo_auditable_models DROP CONSTRAINT IF EXISTS demo_auditable_models_pkey;
ALTER TABLE IF EXISTS ONLY public.company_users DROP CONSTRAINT IF EXISTS company_users_pkey;
ALTER TABLE IF EXISTS ONLY public.company_roles DROP CONSTRAINT IF EXISTS company_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.company_roles DROP CONSTRAINT IF EXISTS company_roles_name_key;
ALTER TABLE IF EXISTS ONLY public.company_roles DROP CONSTRAINT IF EXISTS company_roles_code_key;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_name_key;
ALTER TABLE IF EXISTS ONLY public."SequelizeMeta" DROP CONSTRAINT IF EXISTS "SequelizeMeta_pkey";
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_company_context;
DROP TABLE IF EXISTS public.demo_auditable_models;
DROP TABLE IF EXISTS public.company_users;
DROP TABLE IF EXISTS public.company_roles;
DROP TABLE IF EXISTS public.companies;
DROP TABLE IF EXISTS public."SequelizeMeta";
DROP TYPE IF EXISTS public.enum_users_keycloak_global_role;
--
-- Name: enum_users_keycloak_global_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_keycloak_global_role AS ENUM (
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'COMPANY_USER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_user_id uuid NOT NULL,
    created_company_id uuid,
    updated_user_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_user_id uuid,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: company_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_user_id uuid NOT NULL,
    created_company_id uuid,
    updated_user_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_user_id uuid,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: company_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    company_role_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_user_id uuid NOT NULL,
    created_company_id uuid,
    updated_user_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_user_id uuid,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: demo_auditable_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demo_auditable_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_user_id uuid NOT NULL,
    created_company_id uuid,
    updated_user_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_user_id uuid,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: user_company_context; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_company_context (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keycloak_session_id uuid NOT NULL,
    company_id uuid
);


--
-- Name: COLUMN user_company_context.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_company_context.id IS 'Primary key';


--
-- Name: COLUMN user_company_context.keycloak_session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_company_context.keycloak_session_id IS 'Keycloak session ID from JWT token (unique per session)';


--
-- Name: COLUMN user_company_context.company_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_company_context.company_id IS 'Active company for this session (nullable for SUPER_ADMIN)';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keycloak_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    keycloak_global_role public.enum_users_keycloak_global_role DEFAULT 'COMPANY_USER'::public.enum_users_keycloak_global_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone
);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SequelizeMeta" VALUES ('20241130100000-create-users-table.js');
INSERT INTO public."SequelizeMeta" VALUES ('20241130200000-create-companies-table.js');
INSERT INTO public."SequelizeMeta" VALUES ('20241130300000-create-company-roles-table.js');
INSERT INTO public."SequelizeMeta" VALUES ('20241130400000-create-company-users-table.js');
INSERT INTO public."SequelizeMeta" VALUES ('20241130500000-create-user-company-context-table.js');
INSERT INTO public."SequelizeMeta" VALUES ('20241130600000-create-demo-auditable-models-table.js');


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: company_roles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: company_users; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: demo_auditable_models; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_company_context; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: companies companies_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_key UNIQUE (name);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_roles company_roles_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_code_key UNIQUE (code);


--
-- Name: company_roles company_roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_name_key UNIQUE (name);


--
-- Name: company_roles company_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_pkey PRIMARY KEY (id);


--
-- Name: company_users company_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_pkey PRIMARY KEY (id);


--
-- Name: demo_auditable_models demo_auditable_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_auditable_models
    ADD CONSTRAINT demo_auditable_models_pkey PRIMARY KEY (id);


--
-- Name: user_company_context user_company_context_keycloak_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_company_context
    ADD CONSTRAINT user_company_context_keycloak_session_id_key UNIQUE (keycloak_session_id);


--
-- Name: user_company_context user_company_context_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_company_context
    ADD CONSTRAINT user_company_context_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_keycloak_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_keycloak_id_key UNIQUE (keycloak_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: companies_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX companies_is_active_idx ON public.companies USING btree (is_active);


--
-- Name: companies_is_deleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX companies_is_deleted_idx ON public.companies USING btree (is_deleted);


--
-- Name: companies_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_name_unique ON public.companies USING btree (name);


--
-- Name: company_roles_code_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX company_roles_code_unique ON public.company_roles USING btree (code);


--
-- Name: company_roles_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_roles_is_active_idx ON public.company_roles USING btree (is_active);


--
-- Name: company_roles_is_deleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_roles_is_deleted_idx ON public.company_roles USING btree (is_deleted);


--
-- Name: company_roles_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX company_roles_name_unique ON public.company_roles USING btree (name);


--
-- Name: company_users_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_users_company_id_idx ON public.company_users USING btree (company_id);


--
-- Name: company_users_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_users_is_active_idx ON public.company_users USING btree (is_active);


--
-- Name: company_users_is_deleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_users_is_deleted_idx ON public.company_users USING btree (is_deleted);


--
-- Name: company_users_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_users_role_id_idx ON public.company_users USING btree (company_role_id);


--
-- Name: company_users_user_company_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX company_users_user_company_unique ON public.company_users USING btree (user_id, company_id);


--
-- Name: company_users_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_users_user_id_idx ON public.company_users USING btree (user_id);


--
-- Name: demo_auditable_models_is_deleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX demo_auditable_models_is_deleted_idx ON public.demo_auditable_models USING btree (is_deleted);


--
-- Name: demo_auditable_models_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX demo_auditable_models_name_idx ON public.demo_auditable_models USING btree (name);


--
-- Name: demo_auditable_models_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX demo_auditable_models_status_idx ON public.demo_auditable_models USING btree (status);


--
-- Name: user_company_context_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_context_company_id_idx ON public.user_company_context USING btree (company_id);


--
-- Name: user_company_context_keycloak_session_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_company_context_keycloak_session_id_unique ON public.user_company_context USING btree (keycloak_session_id);


--
-- Name: users_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);


--
-- Name: users_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_is_active_idx ON public.users USING btree (is_active);


--
-- Name: users_keycloak_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_keycloak_id_unique ON public.users USING btree (keycloak_id);


--
-- Name: companies companies_created_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_created_company_id_fkey FOREIGN KEY (created_company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_created_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_created_user_id_fkey FOREIGN KEY (created_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: companies companies_deleted_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_deleted_user_id_fkey FOREIGN KEY (deleted_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_updated_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_updated_user_id_fkey FOREIGN KEY (updated_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_roles company_roles_created_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_created_company_id_fkey FOREIGN KEY (created_company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_roles company_roles_created_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_created_user_id_fkey FOREIGN KEY (created_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_roles company_roles_deleted_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_deleted_user_id_fkey FOREIGN KEY (deleted_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_roles company_roles_updated_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_updated_user_id_fkey FOREIGN KEY (updated_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_users company_users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_users company_users_company_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_company_role_id_fkey FOREIGN KEY (company_role_id) REFERENCES public.company_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_users company_users_created_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_created_company_id_fkey FOREIGN KEY (created_company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_users company_users_created_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_created_user_id_fkey FOREIGN KEY (created_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_users company_users_deleted_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_deleted_user_id_fkey FOREIGN KEY (deleted_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_users company_users_updated_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_updated_user_id_fkey FOREIGN KEY (updated_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_users company_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: demo_auditable_models demo_auditable_models_created_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_auditable_models
    ADD CONSTRAINT demo_auditable_models_created_company_id_fkey FOREIGN KEY (created_company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: demo_auditable_models demo_auditable_models_created_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_auditable_models
    ADD CONSTRAINT demo_auditable_models_created_user_id_fkey FOREIGN KEY (created_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: demo_auditable_models demo_auditable_models_deleted_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_auditable_models
    ADD CONSTRAINT demo_auditable_models_deleted_user_id_fkey FOREIGN KEY (deleted_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: demo_auditable_models demo_auditable_models_updated_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_auditable_models
    ADD CONSTRAINT demo_auditable_models_updated_user_id_fkey FOREIGN KEY (updated_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_company_context user_company_context_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_company_context
    ADD CONSTRAINT user_company_context_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict ZvPUL9SAdpFSKVxFr1yCOK44snHCIqKHukooxIp9vMlJjh1XzfIY7EzempwNcU9

