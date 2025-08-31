import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const PrescriptionModal = ({ appointment, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: '',
    dosage: '',
    instructions: '',
    followUp: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment && appointment.prescription) {
      setFormData({
        diagnosis: appointment.prescription.diagnosis || '',
        medications: appointment.prescription.medications || '',
        dosage: appointment.prescription.dosage || '',
        instructions: appointment.prescription.instructions || '',
        followUp: appointment.prescription.followUp || '',
        notes: appointment.prescription.notes || ''
      });
    } else {
      setFormData({
        diagnosis: '',
        medications: '',
        dosage: '',
        instructions: '',
        followUp: '',
        notes: ''
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.diagnosis.trim() || !formData.medications.trim()) {
      toast.error('Please fill in diagnosis and medications');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {appointment?.prescription ? 'Edit Prescription' : 'Add Prescription'}
        </h3>
        
        <div className="mb-4 p-3 bg-base-200 rounded">
          <p><strong>Patient:</strong> {appointment?.patientName}</p>
          <p><strong>Date:</strong> {appointment?.appointmentDate} at {appointment?.appointmentTime}</p>
          <p><strong>Symptoms:</strong> {appointment?.symptoms || 'Not specified'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Diagnosis *</span>
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className="textarea textarea-bordered h-20"
              placeholder="Enter patient diagnosis..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Medications *</span>
              </label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                className="textarea textarea-bordered h-20"
                placeholder="List medications..."
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Dosage</span>
              </label>
              <textarea
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className="textarea textarea-bordered h-16"
                placeholder="Specify dosage..."
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Instructions</span>
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="textarea textarea-bordered h-20"
              placeholder="Provide instructions for patient..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Follow-up</span>
              </label>
              <input
                type="text"
                name="followUp"
                value={formData.followUp}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="e.g., 2 weeks, 1 month..."
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Additional Notes</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="textarea textarea-bordered h-16"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                appointment?.prescription ? 'Update Prescription' : 'Save Prescription'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default PrescriptionModal;
