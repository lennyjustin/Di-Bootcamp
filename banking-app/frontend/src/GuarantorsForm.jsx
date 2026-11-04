import React, { useEffect, useRef, useState } from 'react';

export default function GuarantorsForm({ members = [], excludeMemberId = '' }) {
  const [guarantors, setGuarantors] = useState([{ memberNo: '', amount: '' }]);
  const fieldsetRef = useRef(null);
  const availableMembers = members.filter((member) => (
    member.id !== excludeMemberId
    && member.status === 'active'
    && member.portalAccess?.enabled
    && member.portalAccess.active
  ));
  const usesMemberList = members.length > 0;

  useEffect(() => {
    const form = fieldsetRef.current?.closest('form');
    if (!form) return undefined;
    const reset = () => setGuarantors([{ memberNo: '', amount: '' }]);
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, []);

  function updateGuarantor(index, key, value) {
    setGuarantors((current) => current.map((guarantor, rowIndex) => (
      rowIndex === index ? { ...guarantor, [key]: value } : guarantor
    )));
  }

  return (
    <fieldset className="loan-guarantors" ref={fieldsetRef}>
      <legend>Guarantors (optional)</legend>
      <p className="application-help">Each guarantor must have an active member portal account and must accept the request before SACCO staff can review it.</p>
      {guarantors.map((guarantor, index) => (
        <div className="loan-guarantor-row" key={index}>
          <label className="form-field">
            {usesMemberList ? 'Guarantor member' : 'Guarantor member number'}
            {usesMemberList ? (
              <select
                value={guarantor.memberNo}
                onChange={(event) => updateGuarantor(index, 'memberNo', event.target.value)}
              >
                <option value="">Choose an active member</option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.memberNo}>{member.fullName} · {member.memberNo}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={guarantor.memberNo}
                minLength="3"
                maxLength="32"
                placeholder="Enter active member number"
                onChange={(event) => updateGuarantor(index, 'memberNo', event.target.value)}
              />
            )}
          </label>
          <label className="form-field">Requested coverage (KES)
            <input
              type="number"
              value={guarantor.amount}
              min="1"
              max="9007199254740991"
              step="1"
              onChange={(event) => updateGuarantor(index, 'amount', event.target.value)}
            />
          </label>
          {guarantors.length > 1 && (
            <button type="button" className="link-button loan-guarantor-remove" onClick={() => {
              setGuarantors((current) => current.filter((_, rowIndex) => rowIndex !== index));
            }}>
              Remove
            </button>
          )}
        </div>
      ))}
      {usesMemberList && !availableMembers.length && (
        <p className="application-help">No other active members with portal access are available to receive a request.</p>
      )}
      <input
        type="hidden"
        name="guarantors"
        value={JSON.stringify(guarantors.filter(({ memberNo, amount }) => memberNo || amount))}
        readOnly
      />
      <button
        type="button"
        className="secondary-button"
        disabled={guarantors.length >= 10}
        onClick={() => setGuarantors((current) => [...current, { memberNo: '', amount: '' }])}
      >
        Add another guarantor
      </button>
    </fieldset>
  );
}
