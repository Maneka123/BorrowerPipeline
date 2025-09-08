import React, { useState, useEffect } from 'react';

const mockApiData = {
  pipeline: {
    new: [
      { id: '1', name: 'Sarah Dunn', loan_type: 'Home Loan', amount: 300000, status: 'Renew' },
      { id: '3', name: 'Lisa Carter', loan_type: 'Home Loan', amount: 450000, status: 'New' },
    ],
    in_review: [
      { id: '2', name: 'Alan Matthews', loan_type: 'Personal Loan', amount: 20000, status: 'In Review' },
    ],
    approved: [],
  },
  borrowers: {
    '1': {
      id: '1',
      name: 'Sarah Dunn',
      email: 'sarah.dunn@example.com',
      phone: '(355)123-4557',
      loan_amount: 300000,
      status: 'In Review',
      employment: 'At Tech Company',
      income: 120000,
      existing_loan: 240000,
      credit_score: 720,
      source_of_funds: 'Declared',
      risk_signal: 'Missing Source of Funds declaration',
      ai_flags: [
        'Income Inconsistent with Bank statements',
        'High Debt-to-Income Ratio detected',
      ],
    },
    '2': {
      id: '2',
      name: 'Alan Matthews',
      email: 'alan.matthews@example.com',
      phone: '(355)555-1234',
      loan_amount: 20000,
      status: 'In Review',
      employment: 'Self-employed',
      income: 50000,
      existing_loan: 5000,
      credit_score: 680,
      source_of_funds: 'Undeclared',
      risk_signal: 'No risk signals',
      ai_flags: [],
    },
    '3': {
      id: '3',
      name: 'Lisa Carter',
      email: 'lisa.carter@example.com',
      phone: '(355)777-9999',
      loan_amount: 450000,
      status: 'New',
      employment: 'Employed at Retail',
      income: 90000,
      existing_loan: 100000,
      credit_score: 710,
      source_of_funds: 'Declared',
      risk_signal: 'Low credit score',
      ai_flags: ['Late payments reported'],
    },
  },
  onboardingWorkflow: {
    steps: [
      'Deal Intake',
      'IDV & Credit Check',
      'Document Upload',
      'AI Validation',
      'Credit Committee',
      'Approval & Docs',
      'Funder Syndication',
    ],
  },
};

const statusColors = {
  New: '#2E86DE',
  Renew: '#27AE60',
  'In Review': '#F39C12',
  Approved: '#16A085',
};

const buttonStyle = {
  padding: '10px 16px',
  marginRight: 12,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: '600',
  color: '#fff',
  backgroundColor: '#2980B9',
  transition: 'background-color 0.3s',
};

const buttonHoverStyle = {
  backgroundColor: '#1B4F72',
};

function StatusBadge({ status }) {
  const color = statusColors[status] || '#7f8c8d';
  return (
    <span
      style={{
        backgroundColor: color,
        color: '#fff',
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
}

function BorrowerCard({ borrower, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 14,
        borderRadius: 8,
        boxShadow: selected
          ? '0 0 12px 3px rgba(41, 128, 185, 0.7)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 12,
        cursor: 'pointer',
        backgroundColor: selected ? '#EAF3FB' : '#fff',
        transition: 'box-shadow 0.3s, background-color 0.3s',
      }}
    >
      <h3 style={{ margin: 0, fontSize: 18 }}>{borrower.name}</h3>
      <p style={{ margin: '4px 0' }}>
        {borrower.loan_type} — ${borrower.amount.toLocaleString()}
      </p>
      <StatusBadge status={borrower.status} />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <p style={{ margin: '6px 0' }}>
      <strong>{label}: </strong> {value}
    </p>
  );
}

function App() {
  const [pipeline, setPipeline] = useState({ new: [], in_review: [], approved: [] });
  const [selectedBorrowerId, setSelectedBorrowerId] = useState(null);
  const [borrowerDetails, setBorrowerDetails] = useState(null);
  const [message, setMessage] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [buttonHover, setButtonHover] = useState(null);

  const fetchPipeline = () => {
    setPipeline(mockApiData.pipeline);
  };

  const fetchBorrowerDetails = (id) => {
    const borrower = mockApiData.borrowers[id];
    if (borrower) {
      setBorrowerDetails(borrower);
      setSelectedBorrowerId(id);
      setMessage('');
    } else {
      setMessage('Borrower not found');
      setBorrowerDetails(null);
    }
  };

  const moveBorrowerToStatus = (id, newStatus) => {
    ['new', 'in_review', 'approved'].forEach((status) => {
      mockApiData.pipeline[status] = mockApiData.pipeline[status].filter(b => b.id !== id);
    });

    const borrower = mockApiData.borrowers[id];
    if (!borrower) return;

    const loanInfo = {
      id: borrower.id,
      name: borrower.name,
      loan_type: borrower.loan_type || 'Unknown',
      amount: borrower.loan_amount || 0,
      status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
    };
    mockApiData.pipeline[newStatus].push(loanInfo);
  };

  const postAction = (id, action) => {
    let successMessage = '';

    switch (action) {
      case 'request-documents':
        successMessage = 'Documents requested.';
        break;
      case 'send-valuer':
        successMessage = 'Valuer notified.';
        break;
      case 'approve':
        successMessage = 'Loan approved.';
        moveBorrowerToStatus(id, 'approved');
        break;
      case 'escalate':
        successMessage = 'Escalated to Credit Committee.';
        break;
      default:
        successMessage = 'Action completed.';
    }

    console.log(`Action: ${action}, Message: ${successMessage}`); // debug log

    setMessage(successMessage);

    fetchPipeline();
    fetchBorrowerDetails(id);

    // Clear message after 4 seconds
    setTimeout(() => setMessage(''), 4000);
  };

  const fetchWorkflow = () => {
    setWorkflowSteps(mockApiData.onboardingWorkflow.steps);
  };

  useEffect(() => {
    fetchPipeline();
    fetchWorkflow();
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: 'auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: 30 }}>
      <h1 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: 30 }}>Borrower Pipeline</h1>

      <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        {['new', 'in_review', 'approved'].map((status) => (
          <div key={status} style={{ flex: '1 1 300px', backgroundColor: '#f9f9f9', borderRadius: 12, padding: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textTransform: 'capitalize', borderBottom: '2px solid #2980B9', paddingBottom: 8, color: '#2980B9' }}>
              {status.replace('_', ' ')}
            </h2>

            {pipeline[status]?.length ? (
              pipeline[status].map(b => (
                <BorrowerCard
                  key={b.id}
                  borrower={b}
                  selected={b.id === selectedBorrowerId}
                  onClick={() => fetchBorrowerDetails(b.id)}
                />
              ))
            ) : (
              <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No borrowers</p>
            )}
          </div>
        ))}
      </div>

      {borrowerDetails && (
        <div
          style={{
            marginTop: 40,
            backgroundColor: '#fff',
            padding: 30,
            borderRadius: 12,
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ borderBottom: '2px solid #2980B9', paddingBottom: 8, marginBottom: 20 }}>
            Borrower Details: {borrowerDetails.name}
          </h2>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <DetailRow label="Email" value={borrowerDetails.email} />
              <DetailRow label="Phone" value={borrowerDetails.phone} />
              <DetailRow label="Loan Amount" value={`$${borrowerDetails.loan_amount.toLocaleString()}`} />
              <DetailRow label="Status" value={<StatusBadge status={borrowerDetails.status} />} />
              <DetailRow label="Employment" value={borrowerDetails.employment} />
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <DetailRow label="Income" value={`$${borrowerDetails.income.toLocaleString()}`} />
              <DetailRow label="Existing Loan" value={`$${borrowerDetails.existing_loan.toLocaleString()}`} />
              <DetailRow label="Credit Score" value={borrowerDetails.credit_score} />
              <DetailRow label="Source of Funds" value={borrowerDetails.source_of_funds} />
              <DetailRow label="Risk Signal" value={borrowerDetails.risk_signal} />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <strong>AI Flags:</strong>
            {borrowerDetails.ai_flags?.length ? (
              <ul style={{ marginTop: 6 }}>
                {borrowerDetails.ai_flags.map((flag, i) => (
                  <li key={i} style={{ color: '#E74C3C' }}>{flag}</li>
                ))}
              </ul>
            ) : (
              <p style={{ marginTop: 6, color: '#27AE60' }}>None</p>
            )}
          </div>

          <div style={{ marginTop: 30 }}>
            {['request-documents', 'send-valuer', 'approve', 'escalate'].map((action) => {
              const labels = {
                'request-documents': 'Request Documents',
                'send-valuer': 'Send to Valuer',
                approve: 'Approve Loan',
                escalate: 'Escalate to Credit Committee',
              };

              return (
                <button
                  key={action}
                  onClick={() => postAction(borrowerDetails.id, action)}
                  onMouseEnter={() => setButtonHover(action)}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: buttonHover === action ? buttonHoverStyle.backgroundColor : buttonStyle.backgroundColor,
                  }}
                >
                  {labels[action]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: 30,
            padding: 15,
            backgroundColor: '#DFF0D8',
            borderRadius: 6,
            color: '#3C763D',
            fontWeight: '600',
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: 50,
          padding: 25,
          backgroundColor: '#f0f4f8',
          borderRadius: 12,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ borderBottom: '2px solid #2980B9', paddingBottom: 8, marginBottom: 15, textAlign: 'center', color: '#2980B9' }}>
          Onboarding Workflow Steps
        </h2>
        <ol style={{ fontSize: 16, color: '#34495E', paddingLeft: 20 }}>
          {workflowSteps.map((step, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default App;
