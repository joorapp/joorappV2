export type ProjectOverviewTeamMemberMock = {
  img?: string;
  profile?: string;
  title: string;
  label_1: string;
  label_2: string;
};

export type ProjectOverviewFileMock = {
  name: string;
  size: string;
  link: string;
};

export type ProjectOverviewCommentMock = {
  username: string;
  userImg?: string;
  comment: string;
  reply?: {
    username: string;
    userImg?: string;
  };
};

export type ProjectOverviewMock = {
  team: ProjectOverviewTeamMemberMock[];
  files: ProjectOverviewFileMock[];
  comments: ProjectOverviewCommentMock[];
  chartSeries: number[];
  chartCategories: string[];
};

const getProjectOverviewMock = (): ProjectOverviewMock => {
  const team: ProjectOverviewTeamMemberMock[] = [
    {
      profile: "AR",
      title: "Arjun Rao",
      label_1: "Project Lead",
      label_2: "QA Owner",
    },
    {
      profile: "SM",
      title: "Sara Mehta",
      label_1: "Site Ops",
      label_2: "Scheduling",
    },
    {
      profile: "VK",
      title: "Vikram Kumar",
      label_1: "Engineering",
      label_2: "Design Review",
    },
  ];

  const files: ProjectOverviewFileMock[] = [
    {
      name: "Project_Building_Plan.pdf",
      size: "2.4 MB",
      link: "#",
    },
    {
      name: "Material_Specifications.xlsx",
      size: "540 KB",
      link: "#",
    },
    {
      name: "Client_Requirements.docx",
      size: "128 KB",
      link: "#",
    },
  ];

  const comments: ProjectOverviewCommentMock[] = [
    {
      username: "Emily Watson",
      comment: "Please confirm the latest revision of the drawing set for approval.",
      reply: { username: "Arjun Rao" },
    },
    {
      username: "Arjun Rao",
      comment: "Updated drawings have been shared. Next steps: review and sign-off.",
    },
  ];

  return {
    team,
    files,
    comments,
    chartCategories: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    chartSeries: [42, 56, 40, 64, 26, 42, 56, 35, 62],
  };
};

export default getProjectOverviewMock;

