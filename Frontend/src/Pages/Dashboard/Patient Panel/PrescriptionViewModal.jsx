import React from 'react';

const PrescriptionViewModal = ({ appointment, isOpen, onClose }) => {
  if (!isOpen || !appointment) return null;

  const prescription = appointment.prescription;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Prescription Details</h3>
        
        <div className="mb-4 p-3 bg-base-200 rounded">
          <p><strong>Patient:</strong> {appointment.patientName}</p>
          <p><strong>Date:</strong> {appointment.appointmentDate} at {appointment.appointmentTime}</p>
          <p><strong>Doctor:</strong> {appointment.doctorEmail}</p>
          <p><strong>Symptoms:</strong> {appointment.symptoms || 'Not specified'}</p>
        </div>

        {prescription ? (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Diagnosis</span>
              </label>
              <div className="p-3 bg-base-100 rounded border">
                {prescription.diagnosis || 'Not specified'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Medications</span>
                </label>
                <div className="p-3 bg-base-100 rounded border">
                  {prescription.medications || 'Not specified'}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Dosage</span>
                </label>
                <div className="p-3 bg-base-100 rounded border">
                  {prescription.dosage || 'Not specified'}
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Instructions</span>
              </label>
              <div className="p-3 bg-base-100 rounded border">
                {prescription.instructions || 'Not specified'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Follow-up</span>
                </label>
                <div className="p-3 bg-base-100 rounded border">
                  {prescription.followUp || 'Not specified'}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Additional Notes</span>
                </label>
                <div className="p-3 bg-base-100 rounded border">
                  {prescription.notes || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            <span>No prescription has been added yet.</span>
          </div>
        )}

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default PrescriptionViewModal;
