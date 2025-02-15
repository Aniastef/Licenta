import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function AppointmentCalendar({ appointments }) {
  return (
    <Calendar
      tileContent={({ date, view }) => {
        const hasAppointment = appointments.some(
          (appt) => new Date(appt.date).toDateString() === date.toDateString()
        );
        return hasAppointment ? <span>📅</span> : null;
      }}
    />
  );
}
