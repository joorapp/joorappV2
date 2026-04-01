import React from "react"
import PropTypes from "prop-types"
import { useTranslation } from "react-i18next"
import { Card, CardBody, CardTitle, Table } from "reactstrap"
import { Link } from "react-router-dom"

const TeamMembers = ({ team }) => {
  const { t } = useTranslation()
  const members = Array.isArray(team) ? team : []

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-4">Team Members</CardTitle>

        <div className="table-responsive">
          <Table className="table align-middle table-nowrap">
            <tbody>
              {members.length > 0 ? (
                members.map((item, key) => (
                  <tr key={key}>
                    <td style={{ width: "50px" }}>
                      {item.img ? (
                        <img
                          src={item.img}
                          className="rounded-circle avatar-xs"
                          alt=""
                        />
                      ) : (
                        <div className="avatar-xs">
                          <span className="avatar-title rounded-circle bg-primary text-white font-size-16">
                            {item.profile}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <h5 className="font-size-14 m-0">
                        <Link to="#" className="text-dark">
                          {item.title}
                        </Link>
                      </h5>
                    </td>
                    <td>
                      <div>
                        <Link
                          to="#"
                          className="badge bg-primary-subtle text-primary font-size-11 me-1"
                        >
                          {item.label_1}
                        </Link>
                        <Link
                          to="#"
                          className="badge bg-primary-subtle text-primary font-size-11"
                        >
                          {item.label_2}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    {t("Common.noDataAvailable")}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  )
}

TeamMembers.propTypes = {
  team: PropTypes.array,
}

export default TeamMembers
