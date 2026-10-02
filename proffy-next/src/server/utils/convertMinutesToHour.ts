export default function convertMinutesToHour(minutes: number) {
    const hour = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${String(hour).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
}
