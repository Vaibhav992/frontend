import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SubmissionsList = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState({});
  const [gradeForm, setGradeForm] = useState({});

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      const [submissionsRes, assignmentRes] = await Promise.all([
        api.get(`/submissions/${assignmentId}`),
        api.get(`/assignments/${assignmentId}`)
      ]);
      setSubmissions(submissionsRes.data.submissions);
      setAssignment(assignmentRes.data.assignment);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId) => {
    setGrading({ ...grading, [submissionId]: true });

    try {
      await api.patch(`/grade/${submissionId}`, {
        grade: gradeForm[submissionId]?.grade,
        feedback: gradeForm[submissionId]?.feedback || ''
      });
      toast.success('Submission graded successfully!');
      fetchData();
      setGradeForm({ ...gradeForm, [submissionId]: {} });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGrading({ ...grading, [submissionId]: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Submissions for: {assignment?.title}
          </h1>
          <p className="text-gray-600 mb-6">{submissions.length} submission(s)</p>

          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{submission.student_name}</h3>
                    <p className="text-sm text-gray-600">{submission.student_email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {submission.grade !== null ? (
                    <div className="text-right">
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                        Grade: {submission.grade}/100
                      </span>
                    </div>
                  ) : (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                      Pending
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">File URL:</p>
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline break-all"
                  >
                    {submission.file_url}
                  </a>
                </div>

                {submission.feedback && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Feedback:</p>
                    <p className="text-gray-900">{submission.feedback}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeForm[submission.id]?.grade || submission.grade || ''}
                        onChange={(e) => setGradeForm({
                          ...gradeForm,
                          [submission.id]: {
                            ...gradeForm[submission.id],
                            grade: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="Enter grade"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback
                      </label>
                      <textarea
                        rows={2}
                        value={gradeForm[submission.id]?.feedback || submission.feedback || ''}
                        onChange={(e) => setGradeForm({
                          ...gradeForm,
                          [submission.id]: {
                            ...gradeForm[submission.id],
                            feedback: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="Enter feedback"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleGrade(submission.id)}
                    disabled={grading[submission.id]}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
                  >
                    {grading[submission.id] ? 'Grading...' : submission.grade !== null ? 'Update Grade' : 'Grade Submission'}
                  </button>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No submissions yet for this assignment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsList;

