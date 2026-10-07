import { useEffect, useState } from "react";
import "./LabReports.css";

const API_BASE_URL = "http://localhost:5001/api";

function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("meroasha_token");

        const response = await fetch(
          `${API_BASE_URL}/lab-reports/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load laboratory reports"
          );
        }

        setReports(data.reports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="lab-reports-page">
        <h1>Laboratory Reports</h1>
        <p>Loading laboratory reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lab-reports-page">
        <h1>Laboratory Reports</h1>
        <div className="lab-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="lab-reports-page">
      <div className="lab-header">
        <div>
          <h1>Laboratory Reports</h1>
          <p>View your laboratory test results and reports.</p>
        </div>

        <div className="lab-count">
          {reports.length} Report{reports.length !== 1 ? "s" : ""}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="lab-empty">
          <h2>No laboratory reports</h2>
          <p>
            Your laboratory reports will appear here after your tests
            are completed.
          </p>
        </div>
      ) : (
        <div className="lab-reports-list">
          {reports.map((report) => (
            <div className="lab-report-card" key={report._id}>
              <div className="report-top">
                <div>
                  <span className="report-label">Report ID</span>
                  <h2>{report.reportId}</h2>
                </div>

                <span
                  className={`report-status ${
                    report.reportStatus?.toLowerCase()
                  }`}
                >
                  {report.reportStatus}
                </span>
              </div>

              <div className="report-details">
                <div>
                  <span>Result</span>
                  <p>{report.result || "Not available"}</p>
                </div>

                <div>
                  <span>Unit</span>
                  <p>{report.unit || "—"}</p>
                </div>

                <div>
                  <span>Reference Range</span>
                  <p>{report.referenceRange || "—"}</p>
                </div>

                <div>
                  <span>Interpretation</span>
                  <p>{report.interpretation || "—"}</p>
                </div>

                <div>
                  <span>Remarks</span>
                  <p>{report.remarks || "—"}</p>
                </div>

                <div>
                  <span>Reported At</span>
                  <p>
                    {report.reportedAt
                      ? new Date(report.reportedAt).toLocaleString()
                      : "Not finalized"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LabReports;