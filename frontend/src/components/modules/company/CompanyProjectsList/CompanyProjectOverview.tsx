import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";

import Breadcrumbs from "../../../common/Breadcrumbs/Breadcrumbs";
// @ts-ignore - legacy JS component
import ProjectDetail from "./ProjectOverview/projectDetail";
// @ts-ignore - legacy JS component
import TeamMembers from "./ProjectOverview/teamMembers";
// @ts-ignore - legacy JS component
import OverviewChart from "./ProjectOverview/overviewChart";
// @ts-ignore - legacy JS component
import AttachedFiles from "./ProjectOverview/attachedFiles";
// @ts-ignore - legacy JS component
import Comments from "./ProjectOverview/comments";
import getProjectOverviewMock from "../../../../core/mocks/projectOverviewMock";

type ProjectOverviewState = {
  project?: Record<string, any>;
};

const CompanyProjectOverview = () => {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const location = useLocation();
  const state = (location.state as ProjectOverviewState | null) ?? null;

  const projectDetail = useMemo(() => {
    // Base project shape from navigation state (if present)
    const baseProject =
      state?.project ??
      (projectId
        ? { id: projectId, team: [], files: [], comments: [] }
        : null);

    if (!baseProject) return null;

    // Dev-only: fill missing sections so the overview UI can be previewed.
    const shouldUseMock = import.meta.env.MODE !== "production";
    if (!shouldUseMock) return baseProject;

    const mock = getProjectOverviewMock();

    return {
      ...mock,
      ...baseProject,
      team: Array.isArray(baseProject.team) && baseProject.team.length > 0 ? baseProject.team : mock.team,
      files: Array.isArray(baseProject.files) && baseProject.files.length > 0 ? baseProject.files : mock.files,
      comments:
        Array.isArray(baseProject.comments) && baseProject.comments.length > 0
          ? baseProject.comments
          : mock.comments,
      chartSeries: Array.isArray(baseProject.chartSeries) && baseProject.chartSeries.length > 0 ? baseProject.chartSeries : mock.chartSeries,
      chartCategories:
        Array.isArray(baseProject.chartCategories) && baseProject.chartCategories.length > 0
          ? baseProject.chartCategories
          : mock.chartCategories,
    };
  }, [projectId, state?.project]);

  return (
    <>
        <Breadcrumbs
          title={t("CompanyProjectsList.pageTitle")}
          breadcrumbItem={t("CompanyProjectsList.projectOverview")}
          breadcrumbParent={t("CompanyProjectsList.breadcrumbItem")}
          link="/company/projects"
        />

        {projectDetail ? (
          <>
            <Row>
              <Col lg="8">
                <ProjectDetail project={projectDetail} />
              </Col>
              <Col lg="4">
                <TeamMembers team={projectDetail.team || []} />
              </Col>
            </Row>

            <Row>
              <Col lg="4">
                <OverviewChart
                  dataColors='["--bs-primary"]'
                  seriesData={projectDetail.chartSeries}
                  categories={projectDetail.chartCategories}
                />
              </Col>
              <Col lg="4">
                <AttachedFiles files={projectDetail.files || []} />
              </Col>
              <Col lg="4">
                <Comments comments={projectDetail.comments || []} />
              </Col>
            </Row>
          </>
        ) : (
          <div className="text-center py-4 text-muted">{t("Common.noDataAvailable")}</div>
        )}
     
  </>
)
};

export default CompanyProjectOverview;
