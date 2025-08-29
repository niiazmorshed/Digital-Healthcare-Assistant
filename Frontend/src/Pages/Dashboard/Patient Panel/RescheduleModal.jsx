import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { appointmentAPI, doctorAPI } from '../../../services/api';

const RescheduleModal = ({ appointment, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctorName, setDoctorName] = useState('N/A');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    appointmentDate: appointment?.appointmentDate || '',
    appointmentTime: appointment?.appointmentTime || '',
    symptoms: appointment?.symptoms || ''
  });

  // Fetch doctor name when appointment changes
  useEffect(() => {
    const fetchDoctorName = async () => {
      if (appointment?.doctorEmail) {
        try {
          const response = await doctorAPI.getAll();
          if (response.success && response.data) {
            const doctor = response.data.find(d => d.email === appointment.doctorEmail);
            if (doctor) {
              setDoctorName(doctor.name || doctor.displayName || 'Dr. ' + appointment.doctorEmail.split('@')[0]);
            } else {
              setDoctorName('Dr. ' + appointment.doctorEmail.split('@')[0]);
            }
          }
        } catch (err) {
          console.error('Error fetching doctor name:', err);
          setDoctorName('Dr. ' + appointment.doctorEmail.split('@')[0]);
        }
      }
    };

    if (isOpen && appointment) {
      fetchDoctorName();
    }
  }, [appointment, isOpen]);

  // Fetch available slots when date changes
  const fetchAvailableSlots = async (selectedDate) => {
    if (!selectedDate || !appointment?.doctorEmail) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      const response = await appointmentAPI.getAvailableSlots(
        appointment.doctorEmail,
        selectedDate
      );
      
      if (response.success) {
        setAvailableSlots(response.data || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If date changes, fetch available slots and reset time
    if (name === 'appointmentDate') {
      fetchAvailableSlots(value);
      setFormData(prev => ({
        ...prev,
        appointmentTime: '' // Reset time when date changes
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if the new slot is still available
      const slotCheck = await appointmentAPI.checkSlotAvailability(
        appointment.doctorEmail,
        formData.appointmentDate,
        formData.appointmentTime,
        appointment._id // Exclude current appointment from conflict check
      );

      if (!slotCheck.available) {
        toast.error('This time slot is no longer available. Please choose another time.');
        // Refresh available slots
        await fetchAvailableSlots(formData.appointmentDate);
        setLoading(false);
        return;
      }

      const updateData = {
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        symptoms: formData.symptoms
      };

      const response = await appointmentAPI.reschedule(appointment._id, updateData);
      
      if (response.success) {
        toast.success('Appointment rescheduled successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      if (error.response?.status === 400) {
        toast.error('Invalid appointment data. Please check your information.');
      } else if (error.response?.status === 409) {
        toast.error('Appointment slot already booked. Please choose another time.');
      } else {
        toast.error('Failed to reschedule appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Reschedule Appointment</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Doctor</span>
            </label>
            <input 
              type="text" 
              value={doctorName} 
              className="input input-bordered" 
              disabled 
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">New Date *</span>
            </label>
            <input 
              type="date" 
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              className="input input-bordered" 
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">New Time *</span>
            </label>
            <select 
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleInputChange}
              className="select select-bordered" 
              required
              disabled={loadingSlots || !formData.appointmentDate}
            >
              <option value="">
                {loadingSlots ? 'Loading slots...' : !formData.appointmentDate ? 'Select Date First' : 'Select Time'}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {formData.appointmentDate && availableSlots.length === 0 && !loadingSlots && (
              <p className="text-sm text-error mt-2 italic">
                No available slots for this date. Please select another date.
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Symptoms/Reason</span>
            </label>
            <textarea 
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              className="textarea textarea-bordered" 
              placeholder="Describe your symptoms or reason for visit"
              rows="3"
            />
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
              disabled={loading || loadingSlots || availableSlots.length === 0}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Rescheduling...
                </>
              ) : (
                'Reschedule Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
